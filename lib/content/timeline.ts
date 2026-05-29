// Condensed, teaser-depth chronology grouped into eras. Key dated milestones
// only; the full year-by-year chronology is in the book (pages 117 to 119).
// Derived from PROJECT.md and the book, not reproduced verbatim.
//
// Types are co-located here (house rule) rather than in types.ts, so this file
// is self-contained.

export type TimelineEventKind = 'life' | 'work' | 'family' | 'exhibition'

export type TimelineEvent = {
  year: number
  title: string
  body?: string
  kind: TimelineEventKind
  // Era this event belongs to, by era slug.
  era: string
  // A pivotal moment is given extra weight in the layout.
  pivotal?: boolean
  // Optional painting or photograph anchored to the moment.
  image?: string
  imageAlt?: string
  imageCaption?: string
  // Optional short attributed quote.
  quote?: { text: string; source: string }
}

export type TimelineEra = {
  slug: string
  label: string
  range: string
  blurb: string
}

// The chronology divides naturally into four chapters.
export const timelineEras: TimelineEra[] = [
  {
    slug: 'before-the-brush',
    label: 'Before the brush',
    range: '1930 to 1963',
    blurb:
      'A Gateshead childhood, the war, the RAF, and the best part of a decade chasing a football.',
  },
  {
    slug: 'the-lucky-break',
    label: 'The lucky break',
    range: '1964 to 1971',
    blurb:
      'A knee injury, a borrowed week at his aunt’s window, and the back lane that set the course of everything after.',
  },
  {
    slug: 'the-painting-years',
    label: 'The painting years',
    range: '1972 to 1994',
    blurb:
      'Marriage, fatherhood, and recognition that ran from a Bigg Market gallery to the Royal Academy.',
  },
  {
    slug: 'last-years-and-legacy',
    label: 'Last years and legacy',
    range: '1995 to 2024',
    blurb:
      'Loss, a final exhibition, and the campaign to set his name beside Lowry and Cornish.',
  },
]

export const kindLabels: Record<TimelineEventKind, string> = {
  life: 'Life',
  work: 'Work',
  family: 'Family',
  exhibition: 'Exhibition',
}

// Marker colour by kind. Squares, echoing the status markers used on Places.
export const kindDotClass: Record<TimelineEventKind, string> = {
  life: 'bg-slate',
  work: 'bg-bensham',
  family: 'bg-ochre',
  exhibition: 'bg-sage',
}

export const timeline: TimelineEvent[] = [
  {
    year: 1930,
    title: 'Born in Gateshead',
    body: 'Charles Henry Rogers born on 16 January at 239 Westbourne Avenue, Bensham, Gateshead.',
    kind: 'life',
    era: 'before-the-brush',
  },
  {
    year: 1939,
    title: 'Evacuated to Bishop Auckland',
    body: 'Evacuated at the outbreak of war; returned to Gateshead in 1944.',
    kind: 'life',
    era: 'before-the-brush',
  },
  {
    year: 1948,
    title: 'RAF national service',
    body: 'Called up for national service with the Royal Air Force.',
    kind: 'life',
    era: 'before-the-brush',
  },
  {
    year: 1950,
    title: 'Football trial at Sunderland',
    body: 'Trialled for Sunderland and played left back for Kibblesworth Colliery Welfare into his mid-thirties. A footballer first, a painter second.',
    kind: 'life',
    era: 'before-the-brush',
  },
  {
    year: 1964,
    title: 'The knee injury that started it all',
    body: 'A heavy blow in a cup tie laid him up for a week. Convalescing at his aunt Violet’s on Bensham Road, he looked out at the back lane opposite and painted it. Cotfield Street was demolished soon after.',
    kind: 'work',
    era: 'the-lucky-break',
    pivotal: true,
    image: '/paintings/web/page_023_img_000.jpg',
    imageAlt:
      'A Tyneside back street by Charlie Rogers, of the kind he began painting in 1964',
    imageCaption: 'The back streets, where it began',
    quote: {
      text: 'I feel I have spent much of my career being pursued by bulldozers.',
      source: 'Charlie Rogers',
    },
  },
  {
    year: 1965,
    title: 'First exhibition',
    body: 'A three-man show at the Univision Gallery, Bigg Market, Newcastle, in March. He appeared on BBC Look North and met Norman Cornish, who became a lifelong friend.',
    kind: 'exhibition',
    era: 'the-lucky-break',
  },
  {
    year: 1967,
    title: 'Royal Academy debut',
    body: 'His first painting accepted for the Royal Academy Summer Exhibition in London, the first of four.',
    kind: 'exhibition',
    era: 'the-lucky-break',
  },
  {
    year: 1971,
    title: 'Redundancy',
    body: 'Made redundant from his groundsman job, which opened the door to painting full-time.',
    kind: 'life',
    era: 'the-lucky-break',
  },
  {
    year: 1973,
    title: 'Marriage to Ann',
    body: 'Married Ann Henderson, a librarian from Haltwhistle, after meeting at the Mayfair Ballroom in Newcastle.',
    kind: 'family',
    era: 'the-painting-years',
  },
  {
    year: 1974,
    title: 'Full-time artist, and a son',
    body: 'Committed to painting full-time. His son, Charlie Junior, was born the same year.',
    kind: 'family',
    era: 'the-painting-years',
    image: '/paintings/web/page_064_img_000.jpg',
    imageAlt: 'A family photograph of Charlie Rogers with Ann and their son',
    imageCaption: 'Charlie with his family',
  },
  {
    year: 1981,
    title: 'Introduced to Prince Charles',
    body: 'Presented to Prince Charles at the Midsummer Eve Soirée, and exhibited at the Royal Academy in the same period.',
    kind: 'exhibition',
    era: 'the-painting-years',
  },
  {
    year: 1994,
    title: 'Royal Charity Exhibition',
    body: 'Work shown at a Royal Charity Exhibition opened by Princess Margaret.',
    kind: 'exhibition',
    era: 'the-painting-years',
  },
  {
    year: 2015,
    title: 'Ann’s death',
    body: 'Ann Rogers died, having been Charlie’s companion and support for more than forty years.',
    kind: 'family',
    era: 'last-years-and-legacy',
  },
  {
    year: 2016,
    title: 'Final exhibition',
    body: 'His final lifetime exhibition, at Low Fell Library, dedicated to Ann.',
    kind: 'exhibition',
    era: 'last-years-and-legacy',
  },
  {
    year: 2020,
    title: 'Death at Aspen Court',
    body: 'Died on 27 April at Aspen Court Care Home, one of eleven residents lost in the first wave of Covid. His last painting, unfinished, was the view from his window across the rooftops of St Vincent Street.',
    kind: 'life',
    era: 'last-years-and-legacy',
    pivotal: true,
  },
  {
    year: 2022,
    title: 'A book begins',
    body: 'Brian Rankin begins the research that becomes Pursued by Bulldozers.',
    kind: 'work',
    era: 'last-years-and-legacy',
  },
  {
    year: 2024,
    title: 'Belonging at the Laing',
    body: 'Blackwell Lane, Gateshead 1981 selected for the Belonging exhibition at the Laing Art Gallery.',
    kind: 'exhibition',
    era: 'last-years-and-legacy',
  },
]

export function eventsByEra(eraSlug: string): TimelineEvent[] {
  return timeline.filter((e) => e.era === eraSlug)
}
