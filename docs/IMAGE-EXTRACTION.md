# Image extraction from the book PDF

The supplied PDF (`/pdf/charlie-rogers-book.pdf`) is the source of all painting imagery for Phase 1 of the site. This document captures what was learned about the file during initial analysis, the extraction pipeline, the gotchas, and the metadata work needed afterwards.

## File facts

- Title from metadata: "Notes"
- Creator: iOS Notes (Quartz PDFContext, iOS 15.8.3)
- This means Brian Rankin produced the PDF by exporting a Notes document from his iPad or iPhone. It is not a designed-for-print PDF and has quirks because of that.
- Pages: 123
- Page size: A4
- File size: 14.5 MB
- Embedded image placements: 343 (verified with PyMuPDF), plus matching soft masks

## Critical caveat: resolution

Every embedded image in this PDF is around **108 ppi**, with the largest at 843 × 597 pixels. This is fine for:

- Web galleries and painting grid views
- Hero images on individual painting pages
- Thumbnails and social media cards

It is nowhere near sufficient for:

- Selling prints at any size larger than playing-card scale
- Print catalogues or physical merchandise
- Any high-fidelity reproduction work

The PDF filename itself confirms this: "BOOK_PDF__Low_Res.pdf". To enable the print sales feature, the project needs original high-resolution scans of each painting from Brian Rankin or Charles Rogers Junior. Flag this in any commerce surface and do not enable print purchase against the low-res assets.

## Toolchain note

The original pipeline was written against poppler (`pdfimages`, `pdftoppm`). poppler is not installed on the build machine, and two of the three gotchas below are artefacts of how poppler handles this particular export. The pipeline has been reimplemented in Python with **PyMuPDF** (rendering) and **Pillow** (variants), which removes those two gotchas entirely. poppler is no longer required. Dependencies are pinned in `/scripts/requirements.txt`.

## Gotcha 1: rotation

A significant number of the embedded images come out of `pdfimages` rotated 180 degrees from their on-page orientation. This is because the iOS Notes export embeds images with arbitrary internal rotation flags that `pdfimages` does not honour.

**Resolved by the PyMuPDF pipeline.** Rather than dumping the stored image stream and guessing which to flip, the pipeline renders each image exactly as it sits on the page, so orientation is correct by construction. There is no manual rotation pass. The placement rotation that the source applied is still recorded in the manifest (`placement_rotation_deg`) for reference.

## Gotcha 2: soft masks

Many of the embedded image objects are paired with a `smask` (soft mask) of the same dimensions. `pdfimages -list` reports both; they have alternating object IDs. The smasks are not paintings, they are alpha channels.

**Resolved by the PyMuPDF pipeline.** Soft masks are never placed on a page in their own right, so `page.get_image_info()` does not return them, and rendering composites a mask over its base image automatically. Nothing needs filtering on parity or object ID. Whether a painting had a soft mask is recorded in the manifest (`has_smask`) for reference.

## Gotcha 3: no inherent metadata

The PDF embeds images but does not carry caption text in any structured form alongside them. To match an extracted painting to its title, year, location, and medium, the pipeline must either:

1. Run page-level OCR against the surrounding text on the same page, and parse the caption that sits below or beside the image, or
2. Use a hand-curated mapping file that lists each painting by source page number and assigns the metadata manually.

Option 2 is more reliable for Phase 1 because the book has under 200 captioned paintings and the captions are often laid out in non-trivial ways (multi-line, italic, sometimes containing the artist's commentary). Build the mapping file iteratively as the catalogue is populated. This is editorial work and sits outside the extraction script.

## Pipeline

The pipeline lives in `/scripts/extract_images.py`, with a thin shell wrapper at `/scripts/extract-images.sh` for the documented command form. It runs three stages in a single pass per page.

```bash
# Install dependencies once
pip install -r scripts/requirements.txt

# Extract everything
python scripts/extract_images.py

# Or a subset, 1-based page numbers
python scripts/extract_images.py --pages 27
python scripts/extract_images.py --pages 26-27

# Or via the wrapper
./scripts/extract-images.sh --pages 27
```

### Stage 1: locate

For each requested page, `page.get_image_info(xrefs=True)` returns every placed image with its on-page rectangle, native pixel dimensions, placement matrix, and object xref. Soft masks do not appear here, so there is nothing to filter out.

### Stage 2: render

Each placement is rendered, clipped to its on-page rectangle, at roughly its native resolution (the render DPI is derived from the rectangle size and the native pixel width, then clamped to 72–300). The result is a PNG master in `/public/paintings/processed`. Because we render the page region, orientation and soft-mask compositing are handled for free.

Images smaller than `--min-dim` pixels on the short side (default 140) are skipped, which drops decorative rules, bullets and icons without losing genuine small paintings.

### Stage 3: thumbnails and web variants

For each master, the pipeline writes a 400px-wide JPEG thumbnail to `/public/paintings/thumbs` and a web-optimised variant (max 1200px wide) to `/public/paintings/web`. The PNG master is preserved in `processed/`.

## Working with full-page rasterisations

For pages that combine paintings, captions, and Trevor Ermel photographs in complex layouts (e.g. page 26 with the Notable Gateshead Locations map, and page 27 with the 8 labelled paintings), it is often more useful to rasterise the whole page than to extract individual images.

```python
# Rasterise page 26 (the Gateshead map) at print quality with PyMuPDF
import fitz
doc = fitz.open("pdf/charlie-rogers-book.pdf")
page = doc[25]  # page 26, zero-based
page.get_pixmap(dpi=300).save("scripts/out/page26.png")
```

Keep these full-page rasters for the editorial team to use as reference when writing painting captions. Do not ship them to production; they include the book's typography and would muddy the site's design. `/scripts/out/` is gitignored.

## Mapping the page 27 starter paintings

Page 27 contains the 8 labelled paintings keyed to the location markers on page 26. The labels in the book are:

1. Saltwell Park
2. 239 Westbourne Avenue
3. Coatsworth Road
4. Shipley Art Gallery
5. Cenotaph
6. St Cuthbert's Church
7. Cotfield Street
8. The Railway Quarter

Plus two unlabelled bonus paintings at the bottom of the page captioned as the Quayside (left) and Bigg Market (right).

Running the extractor against page 27 produces the 8 labelled paintings plus the 2 Newcastle bonus paintings. Placements are returned in reading order: row 1 left to right, then row 2, then row 3. Orientation is corrected automatically (this page was one of the 180-degree-flipped sets under the old poppler pipeline), so no manual rotation is needed.

A starter `seed-paintings.sql` should populate these 8 (plus the 2 Newcastle ones) and key them to the appropriate `location_id` rows. This gives the site enough content to render its first gallery pages.

## Manifest and verification

After extraction, the script writes `/public/paintings/manifest.json` recording, for every kept image:

- Original PDF object xref
- Source page number and placement index
- Native and rendered dimensions, plus the render DPI
- Placement rotation in degrees (`placement_rotation_deg`) and whether the source had a soft mask (`has_smask`)
- Output filenames (processed, thumb, web variants)
- A `verified: false` flag, to be flipped when a human has confirmed the painting matches its assigned metadata

This manifest is the source of truth for the editorial team and for the seed SQL generator.

## What to commit and what to gitignore

Commit:
- `/scripts/extract_images.py`, `/scripts/extract-images.sh`, `/scripts/requirements.txt`
- `/public/paintings/manifest.json`
- `/supabase/migrations/seed-paintings.sql`

Gitignore (regenerable from the PDF):
- `/public/paintings/processed/` (PNG masters)
- `/scripts/out/` (full-page reference rasters)

Commit and serve from production:
- `/public/paintings/thumbs/` and `/public/paintings/web/` (final assets)

For higher-traffic deployments, move the thumbs and web variants to Supabase Storage or a CDN bucket later, but commit-to-public is fine for Phase 1.
