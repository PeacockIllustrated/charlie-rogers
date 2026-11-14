import { entryBySlug, type Entry, type Plate } from './catalogue'

// The work by decade, as Brian Rankin chose it. On 12 November 2026 he sent
// one email per painting for the top of The Work, "individual paintings
// relating to each decade", each to be viewable larger. The order within a
// decade is his order of sending.
//
// Each pick names a catalogue entry. `large` is the file shown in the viewer
// when Brian's photograph of the original is larger than the catalogue image.

export interface Pick {
  slug: string
  large?: Plate
}

export interface DecadePicks {
  decade: number
  picks: { entry: Entry; large: Plate }[]
}

const chosen: Record<number, Pick[]> = {
  1960: [{ slug: 'pop-1967' }],
  1970: [
    { slug: 'pot-pie-bobs-wellington-street-gateshead-1977' },
    { slug: 'bigg-market-newcastle-on-tyne-1975' },
    { slug: 'cotfield-street-bensham-gateshead' },
  ],
  1980: [],
  1990: [{ slug: 'the-monument-with-snow-newcastle-on-tyne-1996' }],
}

export const decadePicks: DecadePicks[] = Object.entries(chosen)
  .map(([decade, picks]) => ({
    decade: Number(decade),
    picks: picks.flatMap((p) => {
      const entry = entryBySlug(p.slug)
      if (!entry) throw new Error(`Decade pick ${p.slug} is not in the catalogue`)
      return [{ entry, large: p.large ?? entry.image }]
    }),
  }))
  .filter((d) => d.picks.length > 0)
