import { extract } from '@/lib/paintings'

// The catalogue: every painting the archive can name. An entry is the unit the
// site is built from; galleries, places and the home page all link to its page
// at /catalogue/[slug].
//
// Nothing here is invented. Titles, years and media come from three sources,
// and each entry records which:
//   original  photographed from the painting itself and supplied by Brian
//             Rankin, with his title, year and medium (lib/shop/catalogue.ts)
//   card      the artwork files for Brian's greeting card collection, titled
//             and dated in his card captions
//   book      a plate in the book PDF, titled from the book's printed caption,
//             Charlie's inscription on the painting, or the page 27 location
//             key, as noted on the entry
// A missing year or medium stays missing and the page says so.

export type Origin = 'original' | 'card' | 'book'

export type Plate = { src: string; width: number; height: number }

export type Entry = {
  slug: string
  title: string
  year?: number
  medium?: string
  // When the sources disagree, the page shows the medium and this note.
  mediumNote?: string
  dimensions?: string
  image: Plate
  alt: string
  origin: Origin
  bookPage?: number
  // Where the title comes from, for book plates.
  titleSource?: 'caption' | 'inscription' | 'location key'
  theme?: string
  place?: string
  // The matching listing in the shop, when there is one.
  shopSlug?: string
  // A photograph of the same scene, reproduced in the book.
  photograph?: Plate & { caption: string; bookPage: number }
  note?: string
}

function original(file: string, width: number, height: number): Plate {
  return { src: `/artwork/web/${file}.jpg`, width, height }
}

function card(file: string, width: number, height: number): Plate {
  return { src: `/artwork/cards/${file}.jpg`, width, height }
}

function book(k: string): Plate {
  const p = extract(k)
  if (!p) throw new Error(`Unknown book extract ${k}`)
  return { src: p.web, width: p.width, height: p.height }
}

const fourDoorsPhoto = extract('page_044_img_001')

export const catalogue: Entry[] = [
  // Photographed from the originals
  {
    slug: 'the-joke-shop-gateshead-on-tyne-1966',
    title: 'The Joke Shop, Gateshead-on-Tyne',
    year: 1966,
    medium: 'Watercolour and pen',
    image: original('the-joke-shop-gateshead-on-tyne-1966', 1600, 1083),
    alt: 'The Joke Shop in the Railway Quarter, Gateshead, under a great railway arch, shopfronts in red and yellow, figures sheltering.',
    origin: 'original',
    theme: 'charlies-gateshead',
    place: 'railway-quarter-gateshead-east',
    shopSlug: 'the-joke-shop-gateshead-on-tyne-1966',
    note: 'Charlie could paint in the Railway Quarter in any weather. The railway arch gave him shelter, and it appears in many of his paintings of the quarter.',
  },
  {
    slug: 'town-moor-newcastle-upon-tyne-1966',
    title: 'Town Moor, Newcastle-upon-Tyne',
    year: 1966,
    medium: 'Watercolour',
    image: original('town-moor-newcastle-upon-tyne-1966', 1600, 1200),
    alt: 'The Hoppings funfair on Newcastle Town Moor: a big wheel, a steam engine and red lorries under a grey sky.',
    origin: 'original',
    theme: 'newcastle',
    shopSlug: 'town-moor-newcastle-upon-tyne-1966',
  },
  {
    slug: 'pop-1967',
    title: 'Pop',
    year: 1967,
    medium: 'Watercolour',
    image: original('pop-1967', 1600, 1169),
    alt: "Charlie's father, Pop, seated at a table crowded with bottles and ornaments, in a flat cap.",
    origin: 'original',
    theme: 'family',
    shopSlug: 'pop-1967',
    note: "Charlie's father Francis, known always as Pop, was one of his earliest and most repeated subjects.",
  },
  {
    slug: 'bensham-road-gateshead-1970',
    title: 'Bensham Road, Gateshead',
    year: 1970,
    medium: 'Watercolour',
    mediumNote:
      "Brian's print email calls this oil on paper; his own greeting card caption says watercolour. Watercolour is shown until he confirms.",
    image: original('bensham-road-gateshead-1970', 1600, 1073),
    alt: 'Bensham Road in deep snow under a heavy blue night sky, a woman pushing a pram past lit shopfronts.',
    origin: 'original',
    theme: 'charlies-gateshead',
    shopSlug: 'bensham-road-gateshead-1970',
    note: 'Bensham Road ran past the house where it all began. His aunt Violet lived at number 262, and it was from her front window that he painted his first picture in 1964.',
  },
  {
    slug: 'the-men-on-the-seats-1973',
    title: 'The Men on the Seats',
    year: 1973,
    medium: 'Oil',
    image: original('the-men-on-the-seats-1973', 1600, 1200),
    alt: 'Eight men in caps and coats seated along a park bench, a black dog in front of them.',
    origin: 'original',
    theme: 'observations-of-people',
    shopSlug: 'the-men-on-the-seats-1973',
    note: 'The black dog is Bruce, who appears across the catalogue long after his death, as a quiet memorial.',
  },
  {
    slug: 'bigg-market-newcastle-on-tyne-1975',
    title: 'Bigg Market, Newcastle-on-Tyne',
    year: 1975,
    medium: 'Watercolour',
    image: original('bigg-market-newcastle-on-tyne-1975', 1600, 1153),
    alt: 'Market stalls and crowds in the Bigg Market, Newcastle, a delivery van among the barrows, tall stone frontages behind.',
    origin: 'original',
    theme: 'newcastle',
    place: 'bigg-market-newcastle',
    shopSlug: 'bigg-market-newcastle-on-tyne-1975',
    note: 'The Univision Gallery on the Bigg Market gave Charlie his first exhibition, in March 1965.',
  },
  {
    slug: 'four-doors-at-school-street-gateshead-1977',
    title: 'Four Doors at School Street, Gateshead',
    year: 1977,
    medium: 'Oil on board',
    image: original('four-doors-at-school-street-gateshead-1977', 1600, 1216),
    alt: 'Four adjoining front doors in a brick terrace, green, red and brown, with worn stone steps.',
    origin: 'original',
    theme: 'charlies-gateshead',
    shopSlug: 'four-doors-at-school-street-gateshead-1977',
    photograph: fourDoorsPhoto && {
      src: fourDoorsPhoto.web,
      width: fourDoorsPhoto.width,
      height: fourDoorsPhoto.height,
      caption: 'The same doors, photographed, as the book prints them beside the painting',
      bookPage: 44,
    },
  },
  {
    slug: 'pot-pie-bobs-wellington-street-gateshead-1977',
    title: 'Pot Pie Bob’s, Wellington Street, Gateshead',
    year: 1977,
    medium: 'Watercolour',
    dimensions: '22 × 21 cm',
    image: original('pot-pie-bobs-wellington-street-gateshead-1977', 1600, 1532),
    alt: 'The High Level Café on Wellington Street, known locally as Pot Pie Bob’s, its blue shopfront set into a stone railway arch, a red pillar box at right.',
    origin: 'original',
    theme: 'charlies-gateshead',
    shopSlug: 'pot-pie-bobs-wellington-street-gateshead-1977',
  },
  {
    slug: 'third-street-back-lane-bensham-gateshead-1980',
    title: 'Third Street, Back Lane, Bensham, Gateshead',
    year: 1980,
    medium: 'Oil on paper',
    image: original('third-street-back-lane-bensham-gateshead-1980', 640, 449),
    alt: 'A snow-covered back lane between brick terraces, a church spire beyond.',
    origin: 'original',
    theme: 'charlies-gateshead',
    shopSlug: 'third-street-back-lane-bensham-gateshead-1980',
  },

  // From the greeting card artwork
  {
    slug: 'street-meeting-with-snow-gateshead-1972',
    title: 'Street Meeting with Snow, Gateshead',
    year: 1972,
    image: card('street-meeting-with-snow-gateshead-1972', 579, 405),
    alt: 'A brass band and a crowd in caps gathered in a snowy Gateshead street, a red banner raised, a pram at right.',
    origin: 'card',
    theme: 'charlies-gateshead',
  },
  {
    slug: 'st-cuthberts-church-gateshead-on-tyne-1982',
    title: 'St Cuthbert’s Church, Gateshead-on-Tyne',
    year: 1982,
    image: card('st-cuthberts-church-gateshead-on-tyne-1982', 605, 423),
    alt: 'A stone church with a slender spire across a snowy road under a clear blue sky.',
    origin: 'card',
    theme: 'charlies-gateshead',
    place: 'st-cuthberts-church-bensham',
  },
  {
    slug: 'the-monument-with-snow-newcastle-on-tyne-1996',
    title: 'The Monument with Snow, Newcastle-on-Tyne',
    year: 1996,
    image: card('the-monument-with-snow-newcastle-on-tyne-1996', 1200, 838),
    alt: "Grey's Monument in snow, the domed curve of Grey Street behind, small figures crossing the square.",
    origin: 'card',
    theme: 'newcastle',
  },
  {
    slug: 'cotfield-street-bensham-gateshead',
    title: 'Cotfield Street, Bensham, Gateshead-on-Tyne',
    image: card('cotfield-street-bensham-gateshead', 635, 445),
    alt: 'Cotfield Street in pen and wash: Taits corner shop at left, terraced houses running uphill, a man walking a dog.',
    origin: 'card',
    theme: 'charlies-gateshead',
    place: 'cotfield-street',
    note: 'Brian’s card caption gives the year as four question marks. It is the street at the heart of the story, and the year is one of the facts still to find.',
  },

  // Plates in the book
  {
    slug: 'saltwell-park',
    title: 'Saltwell Park',
    image: book('page_039_img_000'),
    alt: 'Saltwell Towers in watercolour: a slate-spired corner tower and crenellated red brick, a bare tree in early leaf.',
    origin: 'book',
    bookPage: 39,
    titleSource: 'location key',
    theme: 'charlies-gateshead',
    place: 'saltwell-park',
  },
  {
    slug: 'shipley-art-gallery',
    title: 'Shipley Art Gallery',
    image: book('page_038_img_001'),
    alt: 'The portico of the Shipley Art Gallery with paired columns, a red telephone box and figures at the railings.',
    origin: 'book',
    bookPage: 38,
    titleSource: 'location key',
    theme: 'charlies-gateshead',
    place: 'shipley-art-gallery',
  },
  {
    slug: 'gateshead-cenotaph',
    title: 'Gateshead Cenotaph',
    image: book('page_036_img_000'),
    alt: 'The Gateshead Cenotaph in oil, a soldier in its niche, a lamp standard and a figure walking a black dog.',
    origin: 'book',
    bookPage: 36,
    titleSource: 'location key',
    theme: 'charlies-gateshead',
    place: 'gateshead-cenotaph',
  },
  {
    slug: 'st-cuthberts-church-bensham',
    title: 'St Cuthbert’s Church, Bensham',
    image: book('page_032_img_002'),
    alt: 'A house hung with red creeper beside a broach spire and gabled transept, a figure in blue at the gate.',
    origin: 'book',
    bookPage: 32,
    titleSource: 'location key',
    theme: 'charlies-gateshead',
    place: 'st-cuthberts-church-bensham',
  },
  {
    slug: 'cotfield-street-in-snow',
    title: 'Cotfield Street',
    image: book('page_031_img_003'),
    alt: 'Cotfield Street in snow, a corner shop with a green window, a dark house closing the street, smoking chimneys.',
    origin: 'book',
    bookPage: 31,
    titleSource: 'location key',
    theme: 'charlies-gateshead',
    place: 'cotfield-street',
  },
  {
    slug: 'lady-vernon-school-yard',
    title: 'Lady Vernon School Yard',
    image: book('page_032_img_000'),
    alt: 'A snowy school yard with children at play below terraced houses and a church, in a dark frame.',
    origin: 'book',
    bookPage: 32,
    titleSource: 'caption',
    theme: 'charlies-gateshead',
  },
  {
    slug: 'high-street-shops-gateshead-on-tyne-2005',
    title: 'High Street Shops, Gateshead-on-Tyne',
    year: 2005,
    image: book('page_042_img_000'),
    alt: 'A run of shopfronts on Gateshead High Street in watercolour and pen, flags above the roofline.',
    origin: 'book',
    bookPage: 42,
    titleSource: 'inscription',
    theme: 'charlies-gateshead',
  },
  {
    slug: 'the-central-bar-gateshead',
    title: 'The Central Bar, Gateshead',
    image: book('page_048_img_000'),
    alt: 'The Central Bar, a tall wedge-shaped Victorian pub on a corner, drawn in pen with watercolour.',
    origin: 'book',
    bookPage: 48,
    titleSource: 'caption',
    theme: 'charlies-gateshead',
  },
  {
    slug: 'at-the-cenotaph-gateshead-remembrance-sunday-2010',
    title: 'At the Cenotaph, Gateshead, Remembrance Sunday',
    year: 2010,
    image: book('page_037_img_000'),
    alt: 'Crowds gathered at the Gateshead Cenotaph for Remembrance Sunday, a church tower beyond.',
    origin: 'book',
    bookPage: 37,
    titleSource: 'caption',
    theme: 'charlies-gateshead',
    place: 'gateshead-cenotaph',
  },
  {
    slug: 'cenotaph-at-shipcote-gateshead-on-tyne-2018',
    title: 'Cenotaph at Shipcote, Gateshead-on-Tyne',
    year: 2018,
    image: book('page_037_img_003'),
    alt: 'The Cenotaph at Shipcote in snow and bare trees, a parade passing, painted at eighty-eight.',
    origin: 'book',
    bookPage: 37,
    titleSource: 'caption',
    theme: 'charlies-gateshead',
    place: 'gateshead-cenotaph',
  },
  {
    slug: 'quayside',
    title: 'Quayside',
    image: book('page_076_img_000'),
    alt: 'A statue group on a pediment above an arched gateway on the Newcastle Quayside, figures at the foot.',
    origin: 'book',
    bookPage: 76,
    titleSource: 'location key',
    theme: 'newcastle',
    place: 'quayside-newcastle',
  },
  {
    slug: 'quayside-newcastle-on-tyne-sunday-1987',
    title: 'Quayside, Newcastle-on-Tyne, Sunday',
    year: 1987,
    image: book('page_078_img_000'),
    alt: 'The Quayside Sunday market seen from above, stalls and crowds along the river, with an inset of a pavement artist.',
    origin: 'book',
    bookPage: 78,
    titleSource: 'inscription',
    theme: 'newcastle',
    place: 'quayside-newcastle',
  },
  {
    slug: 'his-hotel-room-paris-1966',
    title: 'His hotel room, Paris',
    year: 1966,
    image: book('page_059_img_000'),
    alt: 'A hotel bedroom drawn in heavy black line with yellow wash: an iron bedstead, a radiator, an inscribed address.',
    origin: 'book',
    bookPage: 59,
    titleSource: 'caption',
    theme: 'paris-and-london',
    note: 'The book’s caption: a scene painted of his hotel room during his visit to Paris in 1966. Charlie inscribed the hotel’s address across the foot.',
  },
  {
    slug: 'bridge-hotel-newcastle',
    title: 'Bridge Hotel',
    image: book('page_094_img_000'),
    alt: 'The Bridge Hotel in Newcastle beside a stone tower, the arch of the Tyne Bridge behind.',
    origin: 'book',
    bookPage: 94,
    titleSource: 'caption',
    theme: 'imagery',
  },
  {
    slug: 'spectators-chester-moor-2008',
    title: 'Spectators, Chester Moor',
    year: 2008,
    image: book('page_017_img_000'),
    alt: 'Two spectators in coats and hats watching a match, in watercolour, inscribed and dated.',
    origin: 'book',
    bookPage: 17,
    titleSource: 'caption',
    theme: 'observations-of-people',
    note: 'Football was his first passion. He was still drawing matches at seventy-eight.',
  },
  {
    slug: 'saltwell-park-2003',
    title: 'Saltwell Park, 23 April 2003',
    year: 2003,
    image: book('page_069_img_000'),
    alt: 'A pencil sketch of figures in Saltwell Park, a child on a ball, adults standing in conversation.',
    origin: 'book',
    bookPage: 69,
    titleSource: 'caption',
    theme: 'observations-of-people',
    place: 'saltwell-park',
  },
]

// Book plates now carried by a catalogue entry, so the untitled strand can
// leave them out.
export const catalogued = new Set(
  catalogue.filter((e) => e.origin === 'book').map((e) => e.image.src),
)

export function entryBySlug(slug: string): Entry | undefined {
  return catalogue.find((e) => e.slug === slug)
}

export function entriesForTheme(theme: string): Entry[] {
  return catalogue.filter((e) => e.theme === theme)
}

export function entriesForPlace(place: string): Entry[] {
  return catalogue.filter((e) => e.place === place)
}

export function isMaster(e: Entry): boolean {
  return e.image.width >= 1000
}

export const ORIGIN_LABEL: Record<Origin, string> = {
  original: 'Photographed from the original',
  card: 'From the greeting card artwork',
  book: 'Reproduced in the book',
}

// Every year a place is known to have been painted: the place's own record
// plus its dated catalogue entries. Feeds the race line.
export function paintedYears(place: { slug: string; painted?: number }): number[] {
  const years = entriesForPlace(place.slug)
    .map((e) => e.year)
    .filter((y): y is number => y !== undefined)
  if (place.painted !== undefined) years.push(place.painted)
  return [...new Set(years)].sort((a, b) => a - b)
}

// The native size and, where catalogued, the entry for any image on the site.
export function imageInfo(
  src: string,
): { width: number; height: number; entry?: Entry } | undefined {
  const entry = catalogue.find((e) => e.image.src === src)
  if (entry) return { width: entry.image.width, height: entry.image.height, entry }
  const m = src.match(/\/paintings\/web\/(page_\d{3}_img_\d{3})\.jpg$/)
  const p = m ? extract(m[1]) : undefined
  return p ? { width: p.width, height: p.height } : undefined
}
