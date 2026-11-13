import { placeBySlug } from './places'
import type { Place } from './types'

// A walk through Charlie's Gateshead: the places on the site that can be
// reached on foot in an afternoon, in walking order from Saltwell Park north
// past St Cuthbert's and the Shipley to the railway arches, so the walk ends a
// short way from the Metro at Gateshead Interchange.
//
// This is deliberately not a guided tour app. There is no GPS, no camera and
// no narration: those belong to a trail run with the council and the
// landowners, which is Brian Rankin's ambition for Saltwell Park and not ours
// to pre-empt. What this page does that a map cannot is put the race in front
// of the walker: what Charlie painted at each stop, and whether it is still
// there to see.

// Which side of its marker a stop's label sits on in the sketch plan, set by
// eye so that no label crosses the route or a neighbour.
export type LabelSide = 'left' | 'right'

export type WalkStop = {
  place: Place
  label: LabelSide
  // What a walker finds today. Taken from the place's own text where that
  // already describes the present; written here only where it does not.
  now: string
}

type StopSource = { slug: string; now?: string; label?: LabelSide }

const route: StopSource[] = [
  { slug: 'saltwell-park' },
  { slug: '239-westbourne-avenue', label: 'left' },
  {
    slug: 'cotfield-street',
    label: 'left',
    // places.ts tells the origin story; a walker needs to know what is left.
    now: 'Nothing of Cotfield Street survives. The marker is on Bensham Road near number 262, the house Charlie painted from, looking across at the back lane opposite. This is the stop where the race started, and the one he lost first.',
  },
  { slug: 'coatsworth-road' },
  { slug: 'st-cuthberts-church-bensham', label: 'left' },
  { slug: 'gateshead-cenotaph' },
  { slug: 'shipley-art-gallery' },
  { slug: 'railway-quarter-gateshead-east', label: 'left' },
]

export const walkStops: WalkStop[] = route.map(({ slug, now, label }) => {
  const place = placeBySlug(slug)
  if (!place?.coords) {
    // Fails the build rather than drawing a walk with a hole in it.
    throw new Error(`Walk stop "${slug}" is missing or has no coordinates`)
  }
  return { place, label: label ?? 'right', now: now ?? place.paragraphs.at(-1) ?? '' }
})

// Great-circle distance in kilometres. Straight lines between markers, several
// of which mark a street rather than a door, so this is a floor, not a promise.
function km(a: Place, b: Place): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const lat1 = toRad(a.coords!.lat)
  const lat2 = toRad(b.coords!.lat)
  const dLat = lat2 - lat1
  const dLng = toRad(b.coords!.lng - a.coords!.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const legKm: number[] = walkStops
  .slice(1)
  .map((stop, i) => km(walkStops[i].place, stop.place))

export const straightLineKm = legKm.reduce((sum, leg) => sum + leg, 0)

export const walkCounts = {
  stops: walkStops.length,
  standing: walkStops.filter((s) => s.place.status === 'extant').length,
  altered: walkStops.filter((s) => s.place.status === 'altered').length,
  gone: walkStops.filter((s) => s.place.status === 'demolished').length,
}

// The whole walk as walking directions in Google Maps. The web URL takes up to
// nine waypoints between origin and destination; this walk has six.
export function directionsUrl(): string {
  const point = (p: Place) => `${p.coords!.lat},${p.coords!.lng}`
  const first = walkStops[0].place
  const last = walkStops[walkStops.length - 1].place
  const between = walkStops.slice(1, -1).map((s) => point(s.place))
  const params = new URLSearchParams({
    api: '1',
    origin: point(first),
    destination: point(last),
    waypoints: between.join('|'),
    travelmode: 'walking',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

// The same, from wherever the reader is now to one stop.
export function stopDirectionsUrl(place: Place): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${place.coords!.lat},${place.coords!.lng}`,
    travelmode: 'walking',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
