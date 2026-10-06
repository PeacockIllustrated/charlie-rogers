import manifest from '@/public/paintings/manifest.json'

// Web-quality assets extracted from the book PDF. Not every extract is a
// painting by Charlie: the PDF also reproduces photographs, exhibition posters,
// newspaper cuttings, the page 26 map, contact-sheet thumbnails of plates that
// appear larger elsewhere, and, on pages 55 to 57, work by Lowry and Cornish.
// Each extract was checked by eye in October 2026 and the ones below are kept
// out of the galleries. See docs/IMAGE-EXTRACTION.md.
export type Painting = {
  web: string
  page: number
  // Native pixel size. Nothing on the site draws an extract larger than this.
  width: number
  height: number
}

type ManifestRow = {
  web: string
  page: number
  native_width: number
  native_height: number
}

// Photographs, posters, catalogue covers, cuttings, notes and the map.
const NOT_PAINTINGS = new Set([
  'page_008_img_000', 'page_009_img_001', 'page_011_img_000', 'page_012_img_000',
  'page_013_img_000', 'page_015_img_000', 'page_015_img_001', 'page_016_img_000',
  'page_016_img_001', 'page_017_img_001', 'page_017_img_002', 'page_024_img_001',
  'page_024_img_002', 'page_026_img_000', 'page_029_img_000', 'page_029_img_002',
  'page_030_img_000', 'page_030_img_002', 'page_031_img_001', 'page_033_img_001',
  'page_033_img_002', 'page_038_img_002', 'page_038_img_003', 'page_041_img_001',
  'page_041_img_003', 'page_043_img_001', 'page_043_img_002', 'page_044_img_001',
  'page_045_img_001', 'page_045_img_002', 'page_045_img_003', 'page_045_img_004',
  'page_045_img_006', 'page_046_img_000', 'page_052_img_000', 'page_053_img_005',
  'page_062_img_002', 'page_064_img_000', 'page_065_img_002', 'page_066_img_003',
  'page_069_img_001', 'page_075_img_001', 'page_079_img_000', 'page_084_img_002',
  'page_100_img_001', 'page_106_img_000', 'page_114_img_000', 'page_116_img_000',
])

// Smaller or cropped repeats of a plate the book prints larger elsewhere, and
// book reproductions of paintings the archive holds as photographed originals.
const DUPLICATES = new Set([
  'page_027_img_000', 'page_027_img_003', 'page_027_img_004', 'page_027_img_005',
  'page_027_img_006', 'page_027_img_008', 'page_031_img_004', 'page_034_img_003',
  'page_037_img_001', 'page_037_img_004', 'page_044_img_000', 'page_049_img_000',
  'page_062_img_004', 'page_087_img_001', 'page_094_img_001', 'page_100_img_005',
  'page_101_img_002', 'page_107_img_004', 'page_111_img_001',
])

// "Creative influences and friendships": Lowry, Cornish and others, not Charlie.
const OTHER_ARTISTS_PAGES = { start: 55, end: 57 }

function key(web: string): string {
  return web.replace(/^web\//, '').replace(/\.jpg$/, '')
}

function isPainting(row: ManifestRow): boolean {
  const k = key(row.web)
  if (NOT_PAINTINGS.has(k) || DUPLICATES.has(k)) return false
  if (row.page >= OTHER_ARTISTS_PAGES.start && row.page <= OTHER_ARTISTS_PAGES.end) return false
  return true
}

const rows = manifest as ManifestRow[]

const toPainting = (m: ManifestRow): Painting => ({
  web: `/paintings/${m.web}`,
  page: m.page,
  width: m.native_width,
  height: m.native_height,
})

const all: Painting[] = rows.filter(isPainting).map(toPainting)

export function allPaintings(): Painting[] {
  return all
}

export function paintingsInRange(start: number, end: number): Painting[] {
  return all.filter((p) => p.page >= start && p.page <= end)
}

// Any extract by its file key, painting or not, for the rare place where a
// photograph from the book is shown beside a painting of the same scene.
export function extract(k: string): Painting | undefined {
  const row = rows.find((r) => key(r.web) === k)
  return row ? toPainting(row) : undefined
}
