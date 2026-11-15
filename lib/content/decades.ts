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

// Brian's photographs, larger than some catalogue images.
const big = (slug: string, width: number, height: number): Pick => ({
  slug,
  large: { src: `/artwork/decades/${slug}.jpg`, width, height },
})

const chosen: Record<number, Pick[]> = {
  1960: [big('pop-1967', 1920, 1449)],
  1970: [
    big('pot-pie-bobs-wellington-street-gateshead-1977', 1920, 1810),
    big('bigg-market-newcastle-on-tyne-1975', 1920, 1345),
    { slug: 'ann-getting-ready-1978' },
    big('cotfield-street-bensham-gateshead', 1920, 1383),
    { slug: 'coal-wagon-1972' },
    { slug: 'discards-salford-1970' },
  ],
  1980: [{ slug: 'christines-piano-1986' }],
  1990: [
    { slug: 'castle-moot-hall-and-all-saints-newcastle-on-tyne-1999' },
    big('the-monument-with-snow-newcastle-on-tyne-1996', 1920, 1332),
  ],
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
