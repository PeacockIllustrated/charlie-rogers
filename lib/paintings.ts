import manifest from '@/public/paintings/manifest.json'

// Web-quality painting assets extracted from the book PDF. Metadata is not yet
// verified per painting, so galleries caption by source page only. See
// docs/IMAGE-EXTRACTION.md.
export type Painting = {
  web: string
  thumb: string
  page: number
  width: number
  height: number
}

type ManifestRow = {
  web: string
  thumb: string
  page: number
  rendered_width: number
  rendered_height: number
}

const all: Painting[] = (manifest as ManifestRow[]).map((m) => ({
  web: `/paintings/${m.web}`,
  thumb: `/paintings/${m.thumb}`,
  page: m.page,
  width: m.rendered_width,
  height: m.rendered_height,
}))

export function allPaintings(): Painting[] {
  return all
}

export function paintingsInRange(start: number, end: number): Painting[] {
  return all.filter((p) => p.page >= start && p.page <= end)
}

export function paintingsOnPage(page: number): Painting[] {
  return all.filter((p) => p.page === page)
}
