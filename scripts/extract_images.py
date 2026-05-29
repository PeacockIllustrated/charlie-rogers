#!/usr/bin/env python3
"""
Image extraction pipeline for the Charlie Rogers book PDF.

This is the PyMuPDF reimplementation of the original poppler pipeline. poppler
(pdfimages / pdfinfo) is not required. See docs/IMAGE-EXTRACTION.md for the full
context, the source-file gotchas, and the resolution caveat.

Why PyMuPDF and not poppler:

  The source PDF is an iOS Notes export (Quartz PDFContext). Two of the three
  documented gotchas are caused by that export, and PyMuPDF removes both of them:

    Gotcha 1 (rotation). poppler's pdfimages dumps the stored image stream and
    ignores the placement rotation flags the Notes export writes, so many images
    come out upside down. Instead of guessing which ones to flip, we render each
    image exactly as it sits on the page. The on-page orientation is always
    correct by construction, so there is no manual rotation pass.

    Gotcha 2 (soft masks). pdfimages lists each smask as a separate object that
    has to be filtered out. Soft masks are never placed on a page on their own,
    so page.get_image_info() does not return them, and rendering composites a
    mask over its base image for free.

  Gotcha 3 (no caption metadata) is unchanged: titles, years and media still
  have to come from a hand-curated mapping or OCR. That is editorial work, not
  extraction work, and lives outside this script.

Stages, all in one pass per page:
  1. Find every placed image and its on-page rectangle.
  2. Render that rectangle to a PNG master in public/paintings/processed.
  3. Write a 400px thumbnail (thumbs/) and a 1200px web variant (web/).
  4. Append a row to public/paintings/manifest.json with verified=false.

Usage:
  python scripts/extract_images.py                 # all pages, default out dir
  python scripts/extract_images.py --pages 27      # only page 27 (starter set)
  python scripts/extract_images.py --pages 26-27
  python scripts/extract_images.py --out scripts/out/smoke --pages 27

Requirements: PyMuPDF and Pillow (scripts/requirements.txt).
"""

from __future__ import annotations

import argparse
import io
import json
import math
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is not installed. Run: pip install -r scripts/requirements.txt")

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed. Run: pip install -r scripts/requirements.txt")


DEFAULT_PDF = "pdf/charlie-rogers-book.pdf"
DEFAULT_OUT = "public/paintings"

# Skip anything smaller than this on its short side. Drops decorative rules,
# bullets and icons without losing genuine small paintings. Tune if needed.
MIN_DIM_PX = 140

# Clamp the render resolution. The source art is roughly 108 ppi, so there is
# nothing to gain above ~300 and we never want to render below screen density.
MIN_DPI = 72
MAX_DPI = 300

THUMB_WIDTH = 400
WEB_MAX_WIDTH = 1200


def parse_pages(spec: str | None, page_count: int) -> list[int]:
    """Turn '27' or '26-27' into a zero-based page-index list. None means all."""
    if not spec:
        return list(range(page_count))
    pages: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            lo, hi = part.split("-", 1)
            pages.extend(range(int(lo), int(hi) + 1))
        else:
            pages.append(int(part))
    # Book pages are 1-based in the docs; convert to 0-based and bounds-check.
    return [p - 1 for p in pages if 1 <= p <= page_count]


def placement_rotation_deg(transform) -> int:
    """Rotation of an image's placement matrix, rounded to the nearest 90.

    Recorded for the manifest only. We render the placement so orientation is
    already correct; this just documents what the source did.
    """
    a, b = transform[0], transform[1]
    angle = math.degrees(math.atan2(b, a))
    return round(angle / 90.0) * 90 % 360


def render_placement(page, info) -> tuple[Image.Image, float]:
    """Render one placed image at roughly its native pixel resolution."""
    bbox = fitz.Rect(info["bbox"])
    native_w = info.get("width", 0) or 1
    width_inches = bbox.width / 72.0 if bbox.width else 0
    dpi = native_w / width_inches if width_inches else 150
    dpi = max(MIN_DPI, min(dpi, MAX_DPI))
    matrix = fitz.Matrix(dpi / 72.0, dpi / 72.0)
    pix = page.get_pixmap(matrix=matrix, clip=bbox, alpha=False)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    return img, dpi


def save_variants(master: Image.Image, thumbs_dir: Path, web_dir: Path, stem: str) -> None:
    """Write a 400px thumbnail and a <=1200px web variant as JPEG."""
    ratio = THUMB_WIDTH / master.width
    thumb = master.resize((THUMB_WIDTH, max(1, round(master.height * ratio))), Image.LANCZOS)
    thumb.save(thumbs_dir / f"{stem}.jpg", "JPEG", quality=85)

    if master.width > WEB_MAX_WIDTH:
        ratio = WEB_MAX_WIDTH / master.width
        web = master.resize((WEB_MAX_WIDTH, max(1, round(master.height * ratio))), Image.LANCZOS)
    else:
        web = master
    web.save(web_dir / f"{stem}.jpg", "JPEG", quality=90)


def main() -> int:
    ap = argparse.ArgumentParser(description="Extract painting images from the book PDF (PyMuPDF).")
    ap.add_argument("--pdf", default=DEFAULT_PDF, help=f"source PDF (default: {DEFAULT_PDF})")
    ap.add_argument("--out", default=DEFAULT_OUT, help=f"output root (default: {DEFAULT_OUT})")
    ap.add_argument("--pages", default=None, help="page or range, 1-based, e.g. '27' or '26-27' (default: all)")
    ap.add_argument("--min-dim", type=int, default=MIN_DIM_PX, help=f"skip images smaller than this on the short side (default: {MIN_DIM_PX})")
    args = ap.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        sys.exit(f"Error: {pdf_path} not found. See pdf/README.md for where to place it.")

    out_root = Path(args.out)
    processed_dir = out_root / "processed"
    thumbs_dir = out_root / "thumbs"
    web_dir = out_root / "web"
    for d in (processed_dir, thumbs_dir, web_dir):
        d.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    pages = parse_pages(args.pages, doc.page_count)

    manifest: list[dict] = []
    kept = skipped = 0

    for page_index in pages:
        page = doc[page_index]
        page_no = page_index + 1  # human, 1-based

        # Map each image xref to its soft-mask xref (0 if none), for the manifest.
        smask_of = {img[0]: img[1] for img in page.get_images(full=True)}

        placements = page.get_image_info(xrefs=True)
        for i, info in enumerate(placements):
            w, h = info.get("width", 0), info.get("height", 0)
            if min(w, h) < args.min_dim:
                skipped += 1
                continue

            stem = f"page_{page_no:03d}_img_{i:03d}"
            try:
                master, dpi = render_placement(page, info)
            except Exception as exc:  # noqa: BLE001 - log and continue, do not abort the run
                print(f"  page {page_no} image {i}: render failed ({exc}), skipped")
                skipped += 1
                continue

            master.save(processed_dir / f"{stem}.png")
            save_variants(master, thumbs_dir, web_dir, stem)

            xref = info.get("xref", 0)
            manifest.append({
                "xref": xref,
                "page": page_no,
                "placement_index": i,
                "native_width": w,
                "native_height": h,
                "rendered_width": master.width,
                "rendered_height": master.height,
                "rendered_at_dpi": round(dpi, 1),
                "placement_rotation_deg": placement_rotation_deg(info["transform"]),
                "has_smask": bool(smask_of.get(xref, 0)),
                "processed": f"processed/{stem}.png",
                "thumb": f"thumbs/{stem}.jpg",
                "web": f"web/{stem}.jpg",
                "verified": False,
            })
            kept += 1

    manifest_path = out_root / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Pages processed : {len(pages)}")
    print(f"Images kept     : {kept}")
    print(f"Images skipped  : {skipped} (smaller than {args.min_dim}px on the short side)")
    print(f"Manifest        : {manifest_path}")
    print("All rows have verified=false. Confirm each painting against its book page before seeding.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
