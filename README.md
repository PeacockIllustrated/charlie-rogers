# Charlie Rogers, Pursued by Bulldozers

A memorial and commerce website for the painter Charlie Rogers (1930 to 2020), built around the book *Charlie Rogers, Pursued by Bulldozers* (Littlecroft Publishing, 2025).

## Getting started

Read `CLAUDE.md` first. It points to the right reading order through `/docs`.

```bash
# Install
pnpm install

# Run dev server
pnpm dev

# Run the image extraction pipeline against the supplied PDF (PyMuPDF, no poppler needed)
pip install -r scripts/requirements.txt
python scripts/extract_images.py
```

## Stack

Next.js 15 (App Router), TypeScript, Tailwind, Supabase, Stripe, Vercel, Sentry.

## Tom

Tom Peacock, Tom.Peacock.Design.
