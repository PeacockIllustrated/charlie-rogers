// Shared content types for the editorial surfaces. Content is original,
// teaser-depth prose derived from the book, not a reproduction of it.

export type Region = 'gateshead' | 'newcastle' | 'beyond'
export type Status = 'extant' | 'demolished' | 'altered' | 'unknown'

export type Quote = { text: string; source: string }

export type StorySection = {
  slug: string
  title: string
  paragraphs: string[]
  quote?: Quote
}

export type Person = {
  slug: string
  name: string
  role: string
  years?: string
  paragraphs: string[]
  image?: string
}

// How closely a coordinate matches its subject. Recorded rather than implied,
// because a pin on a map reads as a precise claim whether or not it is one, and
// half of these places were demolished before anyone thought to record where
// exactly they stood.
//   site     the building or feature itself
//   street   the street, pinned at its midpoint
//   district the area, pinned at its rough centre
export type Precision = 'site' | 'street' | 'district'

export type Coords = {
  lat: number
  lng: number
  precision: Precision
  // Where the position came from, so it can be checked or corrected later.
  basis: string
}

export type Place = {
  slug: string
  name: string
  district?: string
  region: Region
  status: Status
  paragraphs: string[]
  image?: string
  // Absent for places off the Tyneside map, which are listed but not plotted.
  coords?: Coords
}

// TimelineEvent now lives in lib/content/timeline.ts (it carries era, kind, and
// media fields specific to that surface).

export type Exhibition = {
  year: string
  name: string
  venue?: string
  city?: string
  note?: string
  royalAcademy?: boolean
  posthumous?: boolean
}

export type BookFact = { label: string; value: string }
