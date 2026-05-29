#!/usr/bin/env bash
# Thin wrapper around the Python extraction pipeline.
#
# The real work lives in scripts/extract_images.py (PyMuPDF + Pillow).
# poppler is no longer required. See docs/IMAGE-EXTRACTION.md for context.
#
# Usage:
#   ./scripts/extract-images.sh                # all pages
#   ./scripts/extract-images.sh --pages 27     # just the page 27 starter set
#
# Or call Python directly:
#   python scripts/extract_images.py --help

set -euo pipefail

PYTHON="${PYTHON:-python}"
if ! command -v "$PYTHON" >/dev/null 2>&1; then
  PYTHON=python3
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$PYTHON" "$DIR/extract_images.py" "$@"
