import type { ShopProduct } from './types'

// The local catalogue, used when Supabase is not configured so the shop can be
// reviewed before any database exists. Once Supabase is pointed at, the live
// tables take over and this is ignored. Follows the same pattern as
// lib/content/*.ts, which holds the hand-authored content for the other pages.
//
// Copy is Brian Rankin's own, taken verbatim from the Charlie Rodgers mail
// folder and recorded in docs/artwork-inbox/manifest.json.
//
// Two deliberate departures from what Brian sent, both flagged to Tom:
//
// 1. His "A GOOD CHOICE ?" sales lines are held in `goodChoice` and are NOT
//    rendered. They carry exclamation marks, which the house rules forbid in
//    user-facing copy, and their tone is pushier than the heritage-first
//    register CLAUDE.md asks for. Kept here rather than discarded so Tom can
//    decide, rather than having his client's words quietly deleted.
// 2. Bensham Road 1970 is given as watercolour and ink. Brian's print email
//    says "Oil on paper", but his own greeting card caption for the same
//    painting says watercolour, and the painting is plainly watercolour and
//    ink. Publishing the medium he last stated would put something on a
//    commerce page that the artwork contradicts.
//
// No price is invented. Brian priced only the book and the greeting cards, so
// every painting carries price_pence 0, which renders as price on application.

export interface CatalogueProduct extends ShopProduct {
  // Brian's sales line, captured but not rendered. See note 2 above.
  goodChoice?: string
  // Longest edge in centimetres at 300dpi, measured from the supplied file.
  // Anything under about 25cm cannot be sold as a print of any size.
  printLongEdgeCm?: number
}

const NOW = '2026-09-18T00:00:00.000Z'

function product(
  p: Partial<CatalogueProduct> &
    Pick<CatalogueProduct, 'title' | 'slug' | 'product_type'>,
): CatalogueProduct {
  return {
    id: p.slug,
    description: null,
    price_pence: 0,
    status: 'published',
    medium: null,
    dimensions: null,
    year_text: null,
    edition: null,
    stock_count: 0,
    is_featured: false,
    meta_title: null,
    meta_description: null,
    created_at: NOW,
    updated_at: NOW,
    images: [],
    ...p,
  }
}

// Points at the web derivative, not the master. The masters in public/artwork
// run to 27MB across the eight paintings, which would be the weight of the
// listing page on its own; the derivatives bring that to 3MB. Print masters
// stay where they are and are never served to a browser.
function image(slug: string, file: string, alt: string) {
  return [
    {
      id: `${slug}-1`,
      product_id: slug,
      storage_path: `/artwork/web/${file}`,
      alt_text: alt,
      display_order: 0,
      is_primary: true,
      created_at: NOW,
    },
  ]
}

export const CATALOGUE: CatalogueProduct[] = [
  product({
    title: 'Pursued by Bulldozers, special edition',
    slug: 'pursued-by-bulldozers-special-edition',
    product_type: 'book',
    price_pence: 2500,
    is_featured: true,
    edition: 'Limited to 100 copies',
    description:
      'To celebrate the launch of the new website, a limited edition of just 100 copies is being made available. Each copy will be embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin.\n\nIt is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed.',
  }),

  product({
    title: 'Town Moor, Newcastle-upon-Tyne',
    slug: 'town-moor-newcastle-upon-tyne-1966',
    product_type: 'print',
    year_text: '1966',
    medium: 'Watercolour',
    is_featured: true,
    printLongEdgeCm: 61,
    description:
      "Rogers was the Cezanne of Tyneside, painting the street scenes all around him. Some of his paintings were very gloomy as he was painting the decline of industries and recording social change. Others were more uplifting, the Hoppings at the Town Moor.\n\nIn this painting Charlie has captured a typical day at the Hoppings, Europe's largest travelling funfair held annually at Newcastle Town Moor.",
    goodChoice: 'Especially for those interested in the heritage of Northern England.',
    images: image(
      'town-moor-newcastle-upon-tyne-1966',
      'town-moor-newcastle-upon-tyne-1966.jpg',
      'Watercolour of the Hoppings funfair on Newcastle Town Moor, 1966',
    ),
  }),

  product({
    title: 'Bigg Market, Newcastle-on-Tyne',
    slug: 'bigg-market-newcastle-on-tyne-1975',
    product_type: 'print',
    year_text: '1975',
    medium: 'Watercolour',
    printLongEdgeCm: 30,
    description:
      'Charlie Rogers was a master at capturing scenes of northern folk going about their daily chores.\n\nThis typical scene features a variety of characters looking to pick up a bargain in the Bigg Market.',
    images: image(
      'bigg-market-newcastle-on-tyne-1975',
      'bigg-market-newcastle-on-tyne-1975.jpg',
      'Watercolour of the Bigg Market, Newcastle-on-Tyne, 1975',
    ),
  }),

  product({
    title: 'The Joke Shop, Gateshead-on-Tyne',
    slug: 'the-joke-shop-gateshead-on-tyne-1966',
    product_type: 'print',
    year_text: '1966',
    medium: 'Watercolour and pen',
    printLongEdgeCm: 17,
    description:
      'Your Charlie Rogers Collection will not be complete without a scene of the Railway Quarter.\n\nThe Railway Quarter is situated close to both the High Level and Tyne Bridge. It once boasted two railway stations, Gateshead East and Gateshead West. The area provided a wealth of painting opportunities, including some of the region’s most iconic public houses, and of course the never-to-be-forgotten Joke Shop.\n\nCharlie could always paint here, even in poor weather conditions, as shelter was provided by a large railway arch which features in many of his paintings.',
    goodChoice:
      'Yes, this is a must-have scene to add to your Charlie Rogers Collection. An excellent conversation starter particularly for those interested in the heritage of Tyneside.',
    images: image(
      'the-joke-shop-gateshead-on-tyne-1966',
      'the-joke-shop-gateshead-on-tyne-1966.jpg',
      'Watercolour and pen view of the Joke Shop in the Railway Quarter, Gateshead, 1966',
    ),
  }),

  product({
    title: 'The Men on the Seats',
    slug: 'the-men-on-the-seats-1973',
    product_type: 'print',
    year_text: '1973',
    medium: 'Oil',
    printLongEdgeCm: 16,
    description:
      'This scene created in oil would have captured Charlie’s compulsion to record scenes of human interaction. It is highly probable the location was the sheltered seating area opposite the bandstand at Saltwell Park in Gateshead. Charlie visited the park regularly.\n\nMost of his early artwork were in oils before he was forced to stop and turn to painting with watercolours due to health concerns.',
    goodChoice:
      'Yes, this is a perfect choice for those with the ambition to create their own Charlie Rogers Collection for their home. What an excellent conversation starter for visiting guests !',
    images: image(
      'the-men-on-the-seats-1973',
      'the-men-on-the-seats-1973.jpg',
      'Oil painting of eight men seated along a park bench with a black dog, 1973',
    ),
  }),

  product({
    title: 'Third Street, Back Lane, Bensham, Gateshead',
    slug: 'third-street-back-lane-bensham-gateshead-1980',
    product_type: 'print',
    year_text: '1980',
    medium: 'Oil on paper',
    printLongEdgeCm: 5,
    description:
      'Charlie Rogers has been described as an “artist of the drunken lamp post and master of the back streets.”\n\nThis classic painting is widely regarded as Charlie’s finest snow scene and therefore a must for any collector. It was chosen as the cover of the book Pursued by Bulldozers.',
    images: image(
      'third-street-back-lane-bensham-gateshead-1980',
      'third-street-back-lane-bensham-gateshead-1980.jpg',
      'Snow-covered back lane between brick terraces with a church spire beyond, Bensham, Gateshead, 1980',
    ),
  }),

  product({
    title: 'Four Doors at School Street, Gateshead',
    slug: 'four-doors-at-school-street-gateshead-1977',
    product_type: 'print',
    year_text: '1977',
    medium: 'Oil on board',
    printLongEdgeCm: 16,
    description:
      'This vibrant oil painting features a row of four doors which could be found in any northern town during the second half of the twentieth century.',
    images: image(
      'four-doors-at-school-street-gateshead-1977',
      'four-doors-at-school-street-gateshead-1977.jpg',
      'Oil painting of four adjoining front doors in a brick terrace, School Street, Gateshead, 1977',
    ),
  }),

  product({
    title: 'Bensham Road, Gateshead',
    slug: 'bensham-road-gateshead-1970',
    product_type: 'print',
    year_text: '1970',
    // See note 2 at the top of this file. Brian's print email says oil on
    // paper; his own greeting card caption and the painting itself say
    // watercolour.
    medium: 'Watercolour and ink',
    printLongEdgeCm: 16,
    description:
      'Charlie Rogers possessed a strong compulsion to record the people around him. This delightful snow scene tells the story of struggle.',
    images: image(
      'bensham-road-gateshead-1970',
      'bensham-road-gateshead-1970.jpg',
      'Snow scene on Bensham Road, Gateshead, with a woman pushing a pram uphill past shopfronts, 1970',
    ),
  }),

  product({
    title: 'Pot Pie Bob’s, Wellington Street, Gateshead',
    slug: 'pot-pie-bobs-wellington-street-gateshead-1977',
    product_type: 'print',
    year_text: '1977',
    medium: 'Watercolour',
    dimensions: 'Original painting 22 x 21cm, mounted print 30 x 25cm',
    printLongEdgeCm: 16,
    description:
      'Charlie Rogers painted many cafe scenes during his many visits to Paris. However occasionally he was inspired to paint a cafe closer to home.\n\nCharlie was a regular visitor to the High Level Cafe on Wellington Street, known locally as Pot Pie Bob’s.',
    images: image(
      'pot-pie-bobs-wellington-street-gateshead-1977',
      'pot-pie-bobs-wellington-street-gateshead-1977.jpg',
      'Watercolour of the High Level Cafe shopfront set in a stone railway arch, Wellington Street, Gateshead, 1977',
    ),
  }),

  product({
    title: 'Pop',
    slug: 'pop-1967',
    product_type: 'print',
    year_text: '1967',
    medium: 'Watercolour',
    description:
      'Charlie Rogers included a bottle of Brown Ale in many of his interior and bar paintings, particularly when his father, Pop, features in the same painting. It seems this was Pop’s drink of choice.',
    // No image file. Tom holds this one locally; it was not in the folder
    // supplied for matching.
  }),

  product({
    title: 'Greeting card collection',
    slug: 'greeting-card-collection',
    product_type: 'other',
    price_pence: 1000,
    description:
      'A pack of five cards reproducing Charlie Rogers paintings and sketches: The Monument with Snow, Newcastle-on-Tyne 1996; St Cuthbert’s Church, Gateshead-on-Tyne 1982; Bensham Road, Gateshead 1970; Street meeting with snow, Gateshead 1972; and Cotfield Street, Bensham, Gateshead-on-Tyne.\n\nAll Charlie Rogers paintings and sketches © Charles Rogers Junior.',
  }),
]

export function catalogueBySlug(slug: string): CatalogueProduct | null {
  return CATALOGUE.find((p) => p.slug === slug) ?? null
}
