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

export type Place = {
  slug: string
  name: string
  district?: string
  region: Region
  status: Status
  paragraphs: string[]
  image?: string
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
