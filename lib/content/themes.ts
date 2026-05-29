import { paintingsInRange, type Painting } from '@/lib/paintings'
import type { Region } from './types'

// Gallery themes follow the book's own chapter structure. Page ranges map each
// theme to the source pages in the book, so the galleries populate from the
// extracted paintings automatically. Blurbs are short, teaser-depth originals.
export type Theme = {
  slug: string
  title: string
  blurb: string
  region?: Region
  pageStart: number
  pageEnd: number
}

export const themes: Theme[] = [
  {
    slug: 'charlies-gateshead',
    title: "Charlie's Gateshead",
    blurb:
      'The back lanes, corner shops, churches and demolition scenes of the town where he lived and worked.',
    region: 'gateshead',
    pageStart: 24,
    pageEnd: 54,
  },
  {
    slug: 'newcastle',
    title: 'Newcastle',
    blurb:
      'Across the river: the Quayside Sunday market, the bridges, the Bigg Market and the boats on the Tyne.',
    region: 'newcastle',
    pageStart: 76,
    pageEnd: 84,
  },
  {
    slug: 'paris-and-london',
    title: 'Paris and London',
    blurb:
      'Paris was his favourite city, visited more than ten times from 1964. London brought four Royal Academy summer shows.',
    region: 'beyond',
    pageStart: 58,
    pageEnd: 62,
  },
  {
    slug: 'beyond-tyneside',
    title: 'Beyond Tyneside',
    blurb: 'Jersey, Durham, the Dales and the coast, painted on his travels.',
    region: 'beyond',
    pageStart: 85,
    pageEnd: 87,
  },
  {
    slug: 'family',
    title: 'Family',
    blurb:
      'Pop with his bottle of Newcastle Brown, Ann, Charlie Junior, and Bruce the black dog who recurs across the catalogue.',
    pageStart: 63,
    pageEnd: 67,
  },
  {
    slug: 'imagery',
    title: 'Imagery',
    blurb:
      'Nocturnes, snow scenes, churches and pubs, the recurring moods of his work.',
    pageStart: 88,
    pageEnd: 93,
  },
  {
    slug: 'characters',
    title: 'Characters',
    blurb:
      'Rag-and-bone men, street traders and the Tyneside characters who filled his streets.',
    pageStart: 94,
    pageEnd: 97,
  },
  {
    slug: 'observations-of-people',
    title: 'Observations of people',
    blurb:
      'Bar scenes, conversations, readers and quiet figures caught mid-thought.',
    pageStart: 98,
    pageEnd: 103,
  },
  {
    slug: 'interior-scenes',
    title: 'Interior scenes',
    blurb: 'Domestic rooms and kitchens, the indoor counterpoint to the streets.',
    pageStart: 104,
    pageEnd: 106,
  },
  {
    slug: 'industrial-scenes',
    title: 'Industrial scenes',
    blurb: 'The working river and the industry that shaped the region.',
    pageStart: 107,
    pageEnd: 108,
  },
]

export function themeBySlug(slug: string): Theme | undefined {
  return themes.find((t) => t.slug === slug)
}

export function themePaintings(theme: Theme): Painting[] {
  return paintingsInRange(theme.pageStart, theme.pageEnd)
}
