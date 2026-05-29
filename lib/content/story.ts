// Original editorial content derived from the book's facts.
// Not a reproduction of the book; teaser-depth prose only.

import type { Quote } from './types'

// Enriched StorySection shape, co-located here (house rule) since the period and
// image fields are specific to this surface.
export type StorySection = {
  slug: string
  title: string
  period: string
  paragraphs: string[]
  image?: string
  imageAlt?: string
  imageCaption?: string
  quote?: Quote
}

export const storyIntro: string =
  'Gateshead painter Charles Henry Rogers spent 56 years recording the back lanes, pubs, churches, and street corners of Tyneside. He raced the demolition crews and, more often than not, he won. This is how it began, and how it ended.'

export const storySections: StorySection[] = [
  {
    slug: 'the-beginning',
    title: 'The beginning',
    period: '1930 to 1963',
    image: '/paintings/web/page_039_img_000.jpg',
    imageAlt: 'A Gateshead building painted in watercolour by Charlie Rogers',
    imageCaption: 'Gateshead, watercolour',
    paragraphs: [
      'Charles Henry Rogers was born on 16 January 1930 at 239 Westbourne Avenue, Gateshead, the younger of two brothers. When war broke out in 1939, Charlie and his brother Frank were evacuated to Bishop Auckland, returning to Gateshead five years later. After national service with the RAF from 1948, he moved through a string of jobs: Post Office clerk, Rediffusion TV engineer, dockworker at British Ropes, a brief and unloved stint underground at Kibblesworth Colliery, and eventually a groundsman for Durham County Council.',
      'Football was his first passion. He trialled for Sunderland Football Club in 1950 and played left back for Kibblesworth Colliery Welfare well into his mid-thirties. In the late 1950s he was a Butlins Red Coat at Filey and Clacton, once photographed in a holiday camp football team alongside Sean Connery and Des O\'Connor. Painting, at that point, was not yet part of the plan.',
    ],
  },
  {
    slug: 'the-lucky-break',
    title: 'The lucky break',
    period: '1964',
    image: '/paintings/web/page_023_img_000.jpg',
    imageAlt: 'A Tyneside back street in pen and wash by Charlie Rogers',
    imageCaption: 'The back lanes, in pen and wash',
    paragraphs: [
      'In 1964, aged 34, Charlie took a heavy blow to an already damaged left knee during a cup tie for Kibblesworth Colliery Welfare. His doctor signed him off for a week. Limping down Bensham Road to visit his aunt, Violet Gwendoline Woodhead, at number 262, Charlie sat in her front room with a cup of tea and looked out at the back lane opposite.',
      'Over five or six mornings he painted it, using a pen and wash technique he was teaching himself as he went. He titled the result Back Cotfield Street. The street was demolished shortly afterwards. Charlie later described the knee injury as his defining stroke of fortune, and in a letter written more than four decades after the event he closed with a note of gratitude to the opponent who had fouled him.',
    ],
    quote: {
      text: 'And all this I owe to that anonymous dirty little half-back who temporarily crippled me 42 years ago.',
      source: 'Charlie Rogers, from a letter written in 2006',
    },
  },
  {
    slug: 'charlies-gateshead',
    title: "Charlie's Gateshead",
    period: '1964 to 1974',
    image: '/paintings/web/page_035_img_000.jpg',
    imageAlt:
      'A snow-covered Tyneside street under a smoking sky, with a lone figure and a dog',
    imageCaption: 'A Gateshead street, ahead of the bulldozers',
    paragraphs: [
      'The first painting led to more. Charlie walked Bensham looking for subjects: corner shops, cobbled lanes, ancient green gas-lamps, the odd up-and-down streets that he said nobody else seemed to be painting. He attended drawing classes at Gateshead Technical College and later at Newcastle\'s College of Art and Design, where his teacher recognised his instinctive eye and passed his name on to gallery owner Harry Lord.',
      'By 1974, made redundant from his groundsman post, Charlie was a full-time professional artist. His rule was simple: paint what you know. His territory was Gateshead, the Quayside, the streets across the river, and the people going about their business in all of it. As the 1960s and 70s swept away vast areas of Victorian and Edwardian housing, Charlie moved ahead of the wrecking crews. He said, later, that he felt he had spent much of his career being pursued by bulldozers.',
    ],
  },
  {
    slug: 'recognition',
    title: 'Recognition',
    period: '1965 to 1994',
    image: '/paintings/web/page_036_img_000.jpg',
    imageAlt: 'The Gateshead Cenotaph painted in oil by Charlie Rogers',
    imageCaption: 'Gateshead Cenotaph, oil',
    paragraphs: [
      'His first exhibition came about by chance. In March 1965, a painter dropped out of a three-man show at Harry Lord\'s Univision Gallery in Newcastle\'s Bigg Market. Lord offered Charlie the gap. Mounted on pieces of card, the drawings sold. Norman Cornish attended that first exhibition; the two men became lifelong friends, sketching together around each other\'s territory for decades.',
      'Exhibitions at the Shipley Art Gallery, the Westgate Gallery, and the Scottish Royal Academy followed. Charlie entered the Royal Academy Summer Exhibition in London four times, accepted in 1967, 1972, 1975, and 1981. The 1967 entry was another Cotfield Street painting, finished shortly before the street came down. In 1981 he attended the Midsummer Eve Soiree at the Royal Academy and was introduced to the Prince of Wales. In 1994 he exhibited at a Royal Charity Exhibition opened by Princess Margaret.',
    ],
  },
  {
    slug: 'family-and-travels',
    title: 'Family and travels',
    period: '1973 onwards',
    image: '/paintings/web/page_064_img_000.jpg',
    imageAlt: 'A family photograph of Charlie Rogers with Ann and their son',
    imageCaption: 'Charlie with his family',
    paragraphs: [
      'Charlie met Ann Henderson, a librarian from Haltwhistle, at the Mayfair Ballroom in Newcastle. They married in 1973. Their son, Charlie Junior, was born the following year. The family appear throughout the work: Pop, Charlie\'s father Francis, painted asleep in his chair or reading, often with a bottle of Newcastle Brown Ale nearby; Charlie Junior recorded through boyhood in watercolour and oil; and Bruce, Charlie\'s black dog from his younger years, who reappears as a quiet memorial presence across paintings from across the decades.',
      'Paris was his favourite city outside Tyneside, visited more than ten times from 1964 onwards. He also painted in Jersey, London, Harrogate, and Durham. But Gateshead always pulled him back.',
    ],
  },
  {
    slug: 'the-final-years',
    title: 'The final years',
    period: '2015 to 2020',
    image: '/paintings/web/page_028_img_000.jpg',
    imageAlt: 'A snowbound Bensham Road at dusk, painted by Charlie Rogers',
    imageCaption: 'Bensham Road in snow',
    paragraphs: [
      'Ann died in 2015. Charlie dedicated his last exhibition to her memory: a retrospective at Low Fell Library in Gateshead, running from November 2016 into early 2017, curated by his friend Dennis Donnelly.',
      'In 2019 he moved into Aspen Court Care Home in Gateshead. He continued to paint. On 27 April 2020, aged 90, he died there, one of eleven residents lost to the first wave of the Covid pandemic. He and Ann are buried together at Saltwell Cemetery. His final painting, left unfinished on the easel, was the view from his bedroom window across the rooftops of St Vincent Street.',
    ],
  },
]
