import type { ShopProduct } from './types'

// The local catalogue, used when Supabase is not configured so the shop can be
// reviewed before any database exists. Once Supabase is pointed at, the live
// tables take over and this is ignored. Follows the same pattern as
// lib/content/*.ts, which holds the hand-authored content for the other pages.
//
// Copy is Brian Rankin's own, taken verbatim from the Charlie Rodgers mail
// folder and recorded in docs/artwork-inbox/manifest.json.
//
// Three deliberate departures from what Brian sent, all flagged to Tom and
// written up in docs/artwork-inbox/brian-spec-audit.md:
//
// 1. His "A GOOD CHOICE ?" sales lines are held in `goodChoice` and are NOT
//    rendered. They carry exclamation marks, which the house rules forbid in
//    user-facing copy, and their tone is pushier than the heritage-first
//    register CLAUDE.md asks for. Kept here rather than discarded so Tom can
//    decide, rather than having his client's words quietly deleted.
// 2. Bensham Road 1970 is given as watercolour. Brian's print email of 8 June
//    2026 says "Oil on paper"; his own greeting card caption for the same
//    painting, in the Christmas Card Selection PDF of 17 September 2026, says
//    "Watercolour". The card caption is both the later statement and the one
//    the artwork agrees with, so it wins. Nothing here says "and ink": that
//    was an observation of the image, not anything Brian wrote.
// 3. "The prints will be A3 size, the cards will be A6 size", 18 September
//    2026. A6 is published on the card pack, which is a finished product. A3
//    is recorded in `statedPrintSize` and NOT published on any painting,
//    because it is contradicted twice over: only Town Moor carries enough
//    pixels for a 42cm long edge (see artwork-masters/README.md), and Brian's
//    own 9 June email gives Pot Pie Bob's a mounted print of 30 x 25cm. Tom
//    needs to put that to him before a size goes on a commerce page.
//
// No price is invented. Brian priced only the book and the greeting cards, so
// every painting carries price_pence 0, which renders as price on application.

export interface CatalogueProduct extends ShopProduct {
  // Brian's sales line, captured but not rendered. See note 1 above.
  goodChoice?: string
  // Longest edge in centimetres at 300dpi, measured from the supplied file.
  // Anything under about 25cm cannot be sold as a print of any size.
  printLongEdgeCm?: number
  // The print size Brian stated on 18 September 2026, captured but not
  // rendered. See note 3 above.
  statedPrintSize?: string
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

// The card pack is five separate designs, so it gets a gallery rather than one
// image. Order is the order of Brian's own Christmas Card Selection PDF.
function images(
  slug: string,
  files: Array<{ file: string; alt: string }>,
  dir = 'artwork/cards',
) {
  return files.map((f, i) => ({
    id: `${slug}-${i + 1}`,
    product_id: slug,
    storage_path: `/${dir}/${f.file}`,
    alt_text: f.alt,
    display_order: i,
    is_primary: i === 0,
    created_at: NOW,
  }))
}

export const CATALOGUE: CatalogueProduct[] = [
  product({
    title: 'Pursued by Bulldozers, special edition',
    slug: 'pursued-by-bulldozers-special-edition',
    product_type: 'book',
    price_pence: 2500,
    is_featured: true,
    edition: 'Limited to 100 copies',
    // Brian's 16 September 2026 email carries three things: the special
    // edition terms, the price, and the book's own description. All three are
    // his words. His heading "SPECIAL EDITION - EXCLUSIVE TO THIS WEBSITE" is
    // set as a sentence here, per the house rules on case and dashes.
    description:
      'Pursued by Bulldozers is the story of a self-taught artist for whom the streets, back lanes and everyday scenes of life in Gateshead and Newcastle were the inspiration for a little-known collection of sketches and paintings that are receiving widespread local and regional acclaim, both from the public and the artistic community. As the name implies, Charlie’s work captured edifices, landmarks, images and personalities just before they were lost forever to modernisation in the rapidly changing urban communities of the late 20th century North East.\n\nThis special edition is exclusive to this website. To celebrate the launch of the new website, a limited edition of just 100 copies is being made available. Each copy will be embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin.\n\nIt is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed.',
  }),

  product({
    title: 'Town Moor, Newcastle-upon-Tyne',
    slug: 'town-moor-newcastle-upon-tyne-1966',
    product_type: 'print',
    year_text: '1966',
    medium: 'Watercolour',
    is_featured: true,
    printLongEdgeCm: 61,
    statedPrintSize: 'A3',
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
    statedPrintSize: 'A3',
    description:
      'Charlie Rogers was a master at capturing scenes of northern folk going about their daily chores.\n\nThis typical scene features a variety of characters looking to pick up a bargain or two on market day.',
    goodChoice:
      'Every credible private collection of paintings by Charlie Rogers must include a scene of the Bigg Market. After all, Charlie said this was one of his favourite places to paint.',
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
    statedPrintSize: 'A3',
    // Brian's email closes the description with an unattributed quotation,
    // "Look at his paintings and you see scenes that you remember- that
    // Gateshead joke shop by the High Level Bridge, gone but not forgotten."
    // It is left off until he says who said it. A quotation with no speaker,
    // on a memorial site, is worse than no quotation.
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
    // Brian left the medium field off this one. "Oil" is taken from his own
    // description, "This scene created in oil", not from anywhere else.
    medium: 'Oil',
    printLongEdgeCm: 16,
    statedPrintSize: 'A3',
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
    statedPrintSize: 'A3',
    // The cover sentence comes out of Brian's "A Good Choice ?" block, which
    // is the only place he states it. The fact is his; the framing around it
    // is not reproduced.
    description:
      'Charlie Rogers has been described as an “artist of the drunken lamp post and master of the back streets.”\n\nThis classic painting is widely regarded as Charlie’s finest snow scene and therefore a must for any collector. It was chosen as the cover of the book Pursued by Bulldozers.',
    goodChoice:
      'This painting was chosen to be the cover of the book Pursued by Bulldozers. Need I say more ?',
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
    statedPrintSize: 'A3',
    description:
      'This vibrant oil painting features a row of four doors which could be found in any northern town during the second half of the twentieth century.\n\nThe open door appears to invite the viewer in, leaving the viewer with a sense of curiosity.',
    goodChoice:
      'This iwill make an excellent addition to your Charlie Rogers collection. The vibrancy of colours will lift the mood of any room in your home.',
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
    // See note 2 at the top of this file. Brian's print email of 8 June 2026
    // says "Oil on paper"; his own greeting card caption of 17 September 2026
    // says "Watercolour", and the painting agrees with the caption. Still
    // worth putting to him directly, because he has stated both.
    medium: 'Watercolour',
    printLongEdgeCm: 16,
    statedPrintSize: 'A3',
    description:
      'Charlie Rogers possessed a strong compulsion to record the people around him. This delightful snow scene tells the story of struggle.',
    goodChoice:
      'This moment in time confirms Charlie’s dedication to record the struggles of the people he admired and loved in equal measure. Charlie Rogers was a man of the people. This is an excellent addition to your collection.',
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
    // The only painting for which Brian gave real measurements, 9 June 2026.
    // It is also the one his later "prints will be A3 size" statement
    // contradicts, so both are kept and neither is reconciled here.
    dimensions: 'Original painting 22 x 21cm, mounted print 30 x 25cm',
    printLongEdgeCm: 16,
    statedPrintSize: 'A3',
    // The second paragraph is Brian's sentence verbatim. It previously read
    // "the High Level Cafe on Wellington Street, known locally as Pot Pie
    // Bob's", which he never wrote: the cafe name is lettered on the fascia in
    // the painting and the nickname is the title, but "known locally as" was
    // an inference. His own wording says what he meant to say.
    //
    // His email goes on to credit the cafe as the one immortalised in Fog on
    // the Tyne and quotes four lines of the lyric. The lyric is third party
    // copyright and is logged in docs/BACKLOG.md; the claim about the song is
    // left off with it, because the two stand or fall together.
    description:
      'Charlie Rogers painted many cafe scenes during his many visits to Paris. However occasionally he was inspired to paint a cafe closer to home.\n\nCharlie was a regular visitor to this cafe located near the High Level Bridge.',
    goodChoice:
      'Enough has been said already to convince anyone to own a replica of this delightful scene.',
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
    statedPrintSize: 'A3',
    description:
      'Charlie Rogers included a bottle of Brown Ale in many of his interior and bar paintings, particularly when his father, Pop, features in the same painting. It seems this was Pop’s drink of choice.\n\nThis exceptional domestic scene features a rare glimpse inside the living room of the Rogers family home during their residency at Westbourne Avenue, near Saltwell Park.\n\nThis watercolour painting is generally regarded by supporters and academics as Charlie’s finest interior painting.',
    goodChoice:
      'Charlie’s finest domestic scene simply has to be introduced into your Charlie Rogers collection.',
    // 14.8cm at 300dpi. Supplied on 24 September 2026 as Pop.png, a photograph
    // of the sheet lying on a patterned blanket, so the master here is cropped
    // to the paper edge. Nowhere near the A3 Brian states.
    printLongEdgeCm: 15,
    // Brian adds a note under this one: "Newcastle Brown Ale is perceived in
    // the UK as a working-man's beer, with a long association with heavy
    // industry, the traditional economic staple of the North East of England."
    // Editorial background rather than product copy, so it is not rendered.
    images: image(
      'pop-1967',
      'pop-1967.jpg',
      'Watercolour of the Rogers family living room with a bottle of Brown Ale, 1967',
    ),
  }),

  product({
    title: 'Greeting card collection',
    slug: 'greeting-card-collection',
    product_type: 'other',
    price_pence: 1000,
    // "the cards will be A6 size", 18 September 2026. Published here, unlike
    // the A3 figure from the same sentence, because the cards are a finished
    // printed product and nothing he has sent contradicts it.
    dimensions: 'A6, 105 x 148mm',
    description:
      'A pack of five cards reproducing Charlie Rogers paintings and sketches: The Monument with Snow, Newcastle-on-Tyne 1996; St Cuthbert’s Church, Gateshead-on-Tyne 1982; Bensham Road, Gateshead 1970; Street meeting with snow, Gateshead 1972; and Cotfield Street, Bensham, Gateshead-on-Tyne.\n\nAll Charlie Rogers paintings and sketches © Charles Rogers Junior.',
    // The five designs, extracted from Brian's Charlie Rogers Christmas Card
    // Selection PDF of 17 September 2026. Alt text is his own caption wording.
    //
    // These are proofs, not print artwork. Only the first design is anywhere
    // near A6 at 300dpi: 1622px, against the 1748px A6 needs. The other four
    // are around 635px, roughly a third of it. Fine on screen, not printable.
    // Brian holds the originals; see docs/artwork-inbox/brian-spec-audit.md.
    images: images('greeting-card-collection', [
      {
        file: 'the-monument-with-snow-newcastle-on-tyne-1996.jpg',
        alt: 'The Monument with Snow, Newcastle-on-Tyne, 1996, watercolour',
      },
      {
        file: 'st-cuthberts-church-gateshead-on-tyne-1982.jpg',
        alt: 'St Cuthbert’s Church, Gateshead-on-Tyne, 1982, oil',
      },
      {
        file: 'bensham-road-gateshead-1970.jpg',
        alt: 'Bensham Road, Gateshead, 1970, watercolour',
      },
      {
        file: 'street-meeting-with-snow-gateshead-1972.jpg',
        alt: 'Street meeting with snow, Gateshead, 1972, watercolour',
      },
      {
        file: 'cotfield-street-bensham-gateshead.jpg',
        alt: 'Cotfield Street, Bensham, Gateshead-on-Tyne, watercolour',
      },
    ]),
  }),
]

export function catalogueBySlug(slug: string): CatalogueProduct | null {
  return CATALOGUE.find((p) => p.slug === slug) ?? null
}
