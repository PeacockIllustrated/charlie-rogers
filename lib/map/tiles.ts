// Tile sources for the Places map.
//
// Two layers: a modern base map, and an optional historic Ordnance Survey
// overlay showing Tyneside before the demolition programmes.
//
// LICENSING, READ BEFORE CHANGING THIS FILE
//
// The historic OS maps everyone means by "the old map of Gateshead" are the
// National Library of Scotland's georeferenced scans. Since March 2022 NLS
// serves them only through MapTiler Cloud. The free tier covers non-commercial
// use up to 100,000 tile requests a month. This site sells a book, so it is a
// commercial site, and commercial use needs both a paid MapTiler plan and
// written confirmation from NLS at geo@nls.uk.
//
// That is why no historic tile URL is hardcoded here. Hotlinking someone's
// tiles from a commercial page without the arrangement they ask for is not a
// detail to sort out later; it is the kind of thing that gets a heritage
// project a solicitor's letter from the institution it most wants on side.
// Once the arrangement is in place, paste the URL MapTiler gives you into the
// environment and the toggle appears on its own. See docs/MAP.md.

export type TileSource = {
  label: string
  url: string
  attribution: string
  minZoom: number
  maxZoom: number
}

// Read literally, never through a computed key: Next.js inlines NEXT_PUBLIC_*
// at build time by matching the source text, so process.env[name] is empty in
// the browser however correct it looks.
const historicUrl = process.env.NEXT_PUBLIC_HISTORIC_TILE_URL
const historicAttribution = process.env.NEXT_PUBLIC_HISTORIC_TILE_ATTRIBUTION
const historicLabel = process.env.NEXT_PUBLIC_HISTORIC_TILE_LABEL
const historicMaxZoom = process.env.NEXT_PUBLIC_HISTORIC_TILE_MAX_ZOOM
const historicMinZoom = process.env.NEXT_PUBLIC_HISTORIC_TILE_MIN_ZOOM

const baseUrl = process.env.NEXT_PUBLIC_BASE_TILE_URL
const baseAttribution = process.env.NEXT_PUBLIC_BASE_TILE_ATTRIBUTION

// A blank environment variable has to count as unset, not as zero. Number('')
// is 0 and Number.isFinite(0) is true, so an empty NEXT_PUBLIC_..._MAX_ZOOM
// sailed past the fallback and handed Leaflet maxZoom: 0. That is not a
// hypothetical: .env.example ships these keys present and empty, so following
// the documented setup and filling in only the URL and the attribution, which
// is exactly what the instructions ask for, produced an overlay that rendered
// nothing above zoom 0 and looked like a dead layer.
function toZoom(value: string | undefined, fallback: number): number {
  const n = value?.trim() ? Number(value) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

// OpenStreetMap's own tiles are the default because they need no key and no
// account. Their usage policy asks that heavy or commercial consumers move to
// a provider rather than lean on donated capacity, so if this map gets real
// traffic, point NEXT_PUBLIC_BASE_TILE_URL at whichever provider the MapTiler
// account above already pays for and keep one bill instead of two.
const OSM: TileSource = {
  label: 'Street map',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
  minZoom: 10,
  maxZoom: 19,
}

export const baseLayer: TileSource =
  baseUrl && baseAttribution
    ? {
        label: 'Street map',
        url: baseUrl,
        attribution: baseAttribution,
        minZoom: 10,
        maxZoom: 19,
      }
    : OSM

// Null until the licensing above is settled and the environment is filled in.
// The toggle is not rendered while this is null, rather than rendered broken.
export const historicLayer: TileSource | null =
  historicUrl && historicAttribution
    ? {
        label: historicLabel || 'Historic Ordnance Survey',
        url: historicUrl,
        attribution: historicAttribution,
        minZoom: toZoom(historicMinZoom, 10),
        // Historic scans run out of detail well before modern tiles do, and
        // asking for a zoom level that was never generated returns blank tiles
        // rather than an error, which looks like a broken map.
        maxZoom: toZoom(historicMaxZoom, 17),
      }
    : null
