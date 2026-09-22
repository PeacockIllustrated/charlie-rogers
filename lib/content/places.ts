import type { Place } from './types'

export const places: Place[] = [
  // Gateshead
  {
    slug: 'saltwell-park',
    name: 'Saltwell Park',
    district: 'Low Fell, Gateshead',
    region: 'gateshead',
    status: 'extant',
    coords: {
      lat: 54.948,
      lng: -1.61,
      precision: 'district',
      basis:
        'Centre of the park, which covers about 22 hectares, so no single point represents it. Saltwell Towers sits near the northern end.',
    },
    // Saltwell Towers, reproduced full page in the book at 771x517 rather than
    // 179x149 on the page 27 contact sheet. Same painting: the slate-spired
    // corner tower, the crenellated parapet, the bare tree with green buds at
    // right, the three lit windows of the right wing, the figures at the gate
    // bottom left, the same signature and caption line along the foot.
    image: '/paintings/web/page_039_img_000.jpg',
    paragraphs: [
      "Saltwell Park was the green centre of Charlie's world from childhood onward. He returned to it throughout his career, painting Saltwell Towers, the bandstand, and the cemetery where he and Ann are buried. The ornamental lake, the Towers' Victorian turrets, and the park's Orthodox Jewish community on Saturdays all appear across his work.",
      'The park survives intact and is Grade II listed. The Towers, once home to stained-glass manufacturer William Wailes, is the building Brian Rankin has proposed as the site of a permanent Charlie Rogers exhibition.',
    ],
  },
  {
    slug: '239-westbourne-avenue',
    name: '239 Westbourne Avenue',
    district: 'Bensham, Gateshead',
    region: 'gateshead',
    status: 'extant',
    coords: {
      lat: 54.9506,
      lng: -1.6163,
      precision: 'street',
      basis:
        'Midpoint of Westbourne Avenue, Bensham. House numbering along the terrace is not recorded here, so the birthplace itself is not pinned.',
    },
    // Kept at the 176x143 page 27 contact-sheet extract. The street with the
    // large white hoarding and the figure walking a dog is not reproduced
    // anywhere else among the 316 extracts, so there is no larger version of
    // this painting to move to.
    image: '/paintings/thumbs/page_027_img_001.jpg',
    paragraphs: [
      "Charlie was born at 239 Westbourne Avenue on 16 January 1930. The terrace house on the Bensham ridge appears in his work as both a subject and a point of origin, a fixed coordinate for everything that followed.",
      'The street still stands. The house is unremarkable from the outside, which is exactly the point. Charlie spent his career finding what was remarkable in the unremarkable before it disappeared.',
    ],
  },
  {
    slug: 'coatsworth-road',
    name: 'Coatsworth Road',
    district: 'Bensham, Gateshead',
    region: 'gateshead',
    status: 'altered',
    coords: {
      lat: 54.9537,
      lng: -1.6098,
      precision: 'street',
      basis:
        'Midpoint of the commercial stretch. The road runs for most of a mile and Charlie painted along its length.',
    },
    // Kept at the 176x143 page 27 contact-sheet extract. The wet street with
    // the corner shop at left and the lantern tower at right is not reproduced
    // anywhere else among the 316 extracts. page_034_img_001 is a different
    // painting: another Gateshead street, with a green dome and a hoarding
    // lettered "stamps wanted".
    image: '/paintings/thumbs/page_027_img_002.jpg',
    paragraphs: [
      "Coatsworth Road was a commercial spine running through Bensham, lined with the kind of independent shops, pubs, and corner businesses that Charlie painted across his entire career. He returned to it repeatedly, recording shopfronts, signage, and the ordinary foot traffic of a working street.",
      'The road survives but individual buildings have changed hands, been converted, or been replaced. The street Charlie knew is present in fragments, the rest visible only in his paintings.',
    ],
  },
  {
    slug: 'shipley-art-gallery',
    name: 'Shipley Art Gallery',
    district: 'Gateshead town centre',
    region: 'gateshead',
    status: 'extant',
    coords: {
      lat: 54.9564,
      lng: -1.5975,
      precision: 'site',
      basis:
        'The gallery building on Prince Consort Road, which still stands and is Grade II listed.',
    },
    // Shipley Art Gallery in snow, the sketchbook page reproduced at 332x235
    // rather than 180x149 on the page 27 contact sheet. Same painting: the
    // portico with paired columns, the statue on the pier above it, the
    // lettered frieze, the red phone box at right with the pillar box beside
    // it, the figures at the railings left, the same handwritten caption.
    image: '/paintings/web/page_038_img_001.jpg',
    paragraphs: [
      'The Shipley Art Gallery on Prince Consort Road is one of the ambitions Brian Rankin has set out for the Charlie Rogers legacy: a full retrospective in a building Charlie knew well and painted more than once.',
      'The Gallery is Grade II listed and still operates as Gateshead\'s principal public art space. It holds a permanent collection of decorative arts and frequently stages exhibitions of regional work.',
    ],
  },
  {
    slug: 'gateshead-cenotaph',
    name: 'Gateshead Cenotaph',
    district: 'Shipcote, Gateshead',
    region: 'gateshead',
    status: 'extant',
    coords: {
      lat: 54.9541,
      lng: -1.6005,
      precision: 'site',
      basis:
        'The memorial at Shipcote, still in use for Remembrance services.',
    },
    // The Cenotaph at Shipcote in oil, reproduced full page at 776x522 rather
    // than 179x148 on the page 27 contact sheet. Same painting: the pedimented
    // canopy with the soldier in the niche, the lamp standard at left, the
    // seated figure in red on the kerb, the walking figure with a black dog,
    // the pair of traffic light posts, the church spire top right.
    image: '/paintings/web/page_036_img_000.jpg',
    paragraphs: [
      "The Cenotaph at Shipcote appears in Charlie's work as civic architecture given weight: a fixed monument in a town where so much else proved temporary. He painted it with the same close attention he gave the back lanes, taking seriously what official Gateshead had erected and what the community gathered around.",
      'The memorial stands today at the junction near the Old Town Hall site and remains in use for Remembrance services.',
    ],
  },
  {
    slug: 'st-cuthberts-church-bensham',
    name: "St Cuthbert's Church, Bensham",
    district: 'Bensham, Gateshead',
    region: 'gateshead',
    status: 'demolished',
    coords: {
      lat: 54.9578,
      lng: -1.6046,
      precision: 'street',
      basis:
        'Pinned on Bensham Road. The church was demolished, and its exact footprint is one of the things this map cannot yet state.',
    },
    // St Cuthbert's from the bank, reproduced at 247x182 rather than 176x143 on
    // the page 27 contact sheet. Same painting: the house hung with red creeper
    // at left, the dark conifer beside it, the broach spire, the gabled
    // transept with its cross finial, the white gate and railings, the grassy
    // bank, the figure in blue bottom right. Not page_032_img_001, which is a
    // different, closer painting of the same church.
    image: '/paintings/web/page_032_img_002.jpg',
    paragraphs: [
      "St Cuthbert's on Bensham Road was one of the Victorian churches Charlie painted before demolition took it. It stood within the Bensham neighbourhood he knew better than anywhere, a few streets from Westbourne Avenue and close to the back lanes where his painting life began.",
      'The church is gone. Charlie\'s painting is among the few records of how it looked from the street. This is the pattern that defines his career: the subject persists in paint long after the builders have finished.',
    ],
  },
  {
    slug: 'cotfield-street',
    name: 'Cotfield Street',
    district: 'Bensham, Gateshead',
    region: 'gateshead',
    status: 'demolished',
    coords: {
      lat: 54.9527,
      lng: -1.6112,
      precision: 'street',
      basis:
        'Pinned near 262 Bensham Road, the house Charlie painted from, looking at the back lane opposite. The street itself is gone.',
    },
    // The snowbound street in oil, reproduced at 246x205 rather than 176x143 on
    // the page 27 contact sheet. Same painting: the corner shop at left with
    // its green window and the disc sign on the angle, the dark house closing
    // the street with lit windows and a red door, the yellow passage wall at
    // right, the two smoking chimneys, the same signature bottom left.
    image: '/paintings/web/page_031_img_003.jpg',
    paragraphs: [
      'Cotfield Street is where it started. Laid up with a knee injury in 1964, Charlie sat in his Aunt Violet Gwendoline Woodhead\'s front room at 262 Bensham Road and looked out at the back lane opposite. Over five or six mornings he painted what he saw, in pen and wash. The result was titled "Back Cotfield Street". The street was demolished shortly after.',
      'Forty-two years later he wrote that he owed it all to the anonymous half-back who temporarily crippled him. Cotfield Street is the origin point for a body of work that eventually reached the Royal Academy four times.',
    ],
  },
  {
    slug: 'railway-quarter-gateshead-east',
    name: 'Railway Quarter (Gateshead East)',
    district: 'Gateshead East',
    region: 'gateshead',
    status: 'altered',
    coords: {
      lat: 54.9604,
      lng: -1.5983,
      precision: 'district',
      basis:
        'Rough centre of the railway approaches east of the town centre. This is an area rather than an address.',
    },
    // Photograph of the original supplied by Brian Rankin, in place of the
    // 175x143 book extract. The Joke Shop, 1966: West Street under the
    // Gateshead railway viaduct. The same painting is reproduced in the book
    // on page 50.
    image: '/artwork/web/the-joke-shop-gateshead-on-tyne-1966.jpg',
    paragraphs: [
      "The area around Gateshead East station and the railway approaches was working industrial townscape: brick arches, goods yards, the infrastructure of a town that moved things by rail. Charlie painted its textures and geometries at a time when the whole eastern approach to Gateshead was being reconsidered by planners.",
      'The area has been heavily altered. The flyover and Gateshead town centre redevelopments reshaped what Charlie recorded. His paintings document a grain of the city that has been largely smoothed away.',
    ],
  },

  // Newcastle
  {
    slug: 'quayside-newcastle',
    name: 'Quayside',
    district: 'Newcastle upon Tyne',
    region: 'newcastle',
    status: 'extant',
    coords: {
      lat: 54.969,
      lng: -1.6014,
      precision: 'district',
      basis:
        'The riverside between the Swing Bridge and the Quayside market stretch.',
    },
    // The Fish Market frontage, reproduced at 327x242 rather than 176x144 on
    // the page 27 contact sheet. Same painting: the statue group on the
    // pediment with one arm raised, the arched gateway with its fanlight and
    // blue-shaded gates, the run of arched windows, the green-domed tower and
    // clock cupola to the right, the small group of figures bottom right.
    image: '/paintings/web/page_076_img_000.jpg',
    paragraphs: [
      "Newcastle's Quayside was a second territory for Charlie, reached across the High Level Bridge from Gateshead. He painted the Sunday Market, the fish market, the warehouses, and the river itself across several decades, always more interested in the people and the trade than in the bridges as monuments.",
      "The Quayside has been comprehensively gentrified since Charlie's active years but the fundamental geography, the Tyne, the Swing Bridge, the buildings on the bank, is intact. The Sunday Market he painted no longer operates in the same form.",
    ],
  },
  {
    slug: 'bigg-market-newcastle',
    name: 'Bigg Market',
    district: 'Newcastle upon Tyne',
    region: 'newcastle',
    status: 'extant',
    coords: {
      lat: 54.9726,
      lng: -1.6136,
      precision: 'site',
      basis:
        'The market place itself. The Univision Gallery that gave Charlie his first show in 1965 stood on it.',
    },
    // Photograph of the original supplied by Brian Rankin, in place of the
    // 176x143 book extract. Bigg Market, Newcastle-on-Tyne, 1975: stalls and a
    // fruit and vegetable lorry below the Victorian frontages. A different
    // Bigg Market painting of the same year appears in the book on page 81.
    image: '/artwork/web/bigg-market-newcastle-on-tyne-1975.jpg',
    paragraphs: [
      "Bigg Market has a particular significance in Charlie's story: the Univision Gallery on the market gave him his first exhibition in March 1965. Harry Lord, the gallerist, took the work and showed it. Charlie had been painting for less than two years. The show sold well.",
      "He returned to Bigg Market as a subject throughout his career. The market's Victorian commercial buildings, the pub fronts, and the particular light of a covered urban space recur in his Newcastle work.",
    ],
  },

  // Beyond
  {
    slug: 'paris',
    name: 'Paris',
    district: 'France',
    region: 'beyond',
    status: 'extant',
    paragraphs: [
      'Paris was Charlie\'s favourite city beyond Tyneside. He made over ten visits from 1964 onwards, drawn to the street life and café culture that rhymed with what he painted at home. The market traders, the pavement conversations, the urban density, all translated naturally into the pen and wash method he had developed in Bensham back lanes.',
      "His Paris paintings sit alongside the Gateshead work without contradiction. The same eye, a different city. Albert Marquet, whom Charlie named as an influence, had painted Paris from café windows for decades before Charlie arrived.",
    ],
  },
  {
    slug: 'spennymoor',
    name: 'Spennymoor',
    district: 'County Durham',
    region: 'beyond',
    status: 'extant',
    coords: {
      lat: 54.6975,
      lng: -1.6003,
      precision: 'district',
      basis:
        'The town centre, about 19 miles south of Gateshead. Plotted for the record but well off the Tyneside frame.',
    },
    paragraphs: [
      'Spennymoor connects Charlie to Norman Cornish MBE, the mining painter he met at his first exhibition in 1965 and befriended for life. Brian Rankin positions Rogers, Cornish, and Lowry as the three names in a lineage of post-war Northern English chroniclers of working-class life. Spennymoor was Cornish\'s territory as Gateshead was Charlie\'s.',
      'The town is still there. The Spennymoor Settlement, where Cornish trained, remains a reference point for the tradition both painters worked within.',
    ],
  },
]

export function placeBySlug(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug)
}

export function placesByRegion(
  region: Place['region'],
): Place[] {
  return places.filter((p) => p.region === region)
}

export const regionOrder: Place['region'][] = ['gateshead', 'newcastle', 'beyond']

export const regionLabels: Record<Place['region'], string> = {
  gateshead: 'Gateshead',
  newcastle: 'Newcastle',
  beyond: 'Beyond Tyneside',
}
