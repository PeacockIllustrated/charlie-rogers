// A "look inside" sample of the book's opening, styled as book pages for the
// flip-book on /book. The prose is condensed and rewritten from the book's first
// chapter, not reproduced verbatim: enough to give the feel of reading it, and
// it ends by pointing to the full book. Short attributed quotes are Charlie's own.

export type SamplePage =
  | {
      kind: 'title'
      eyebrow: string
      title: string
      subtitle: string
      meta: string
    }
  | {
      kind: 'text'
      eyebrow: string
      heading: string
      paragraphs: string[]
      quote?: { text: string; source: string }
    }
  | {
      kind: 'plate'
      image: string
      alt: string
      caption: string
    }
  | {
      kind: 'cta'
      eyebrow: string
      heading: string
      paragraphs: string[]
    }

// Eight pages, read as four spreads.
export const bookSamplePages: SamplePage[] = [
  {
    kind: 'title',
    eyebrow: 'Littlecroft Publishing, 2025',
    title: 'Charlie Rogers',
    subtitle: 'Pursued by Bulldozers',
    meta: 'Compiled by Brian Rankin',
  },
  {
    kind: 'text',
    eyebrow: 'Prologue',
    heading: 'The story begins',
    paragraphs: [
      'On the morning of 4 February 2023, Brian Rankin knocked on the door of a terraced house in Gateshead. He had been invited to view the work of a local artist who had died three years before.',
      'What he found that morning was unexpected and extraordinary: a record of more than sixty years of Tyneside, gathered room by room and guided by the artist’s son.',
      'Hundreds of hours of research followed. This book is the result, and an argument that Charlie Rogers belongs beside Lowry and Cornish.',
    ],
  },
  {
    kind: 'text',
    eyebrow: 'One · The beginning',
    heading: 'Early years',
    paragraphs: [
      'Charles Henry Rogers was born on 16 January 1930 to Francis and Grace Rogers, at 239 Westbourne Avenue, Gateshead. The house had no inside bathroom; the toilet stood beside the coal store in the back yard. Charlie was the younger of two brothers, behind his brother Frank.',
      'At Kelvin Grove Elementary School a teacher spotted his talent and urged him towards art college. It was wartime, and money was short. His parents, reluctantly, said no.',
    ],
  },
  {
    kind: 'plate',
    image: '/paintings/web/page_023_img_000.jpg',
    alt: 'A Tyneside back street in pen and wash by Charlie Rogers',
    caption: 'A Gateshead back street, pen and wash',
  },
  {
    kind: 'text',
    eyebrow: 'One · The beginning',
    heading: 'War, work, and a holiday camp',
    paragraphs: [
      'When war came in 1939, Charlie and Frank were evacuated to Bishop Auckland for five years. He returned to a working life of odd jobs: clerk, national service in the RAF, a brief and unloved spell underground at Kibblesworth pit, then British Ropes, the Post Office, and Barkers Electricians.',
      'In the late 1950s he was a Butlins Red Coat at Filey and Clacton, once photographed in a holiday camp football team alongside Sean Connery and Des O’Connor.',
    ],
  },
  {
    kind: 'text',
    eyebrow: 'One · The beginning',
    heading: 'Two passions',
    paragraphs: [
      'Charlie had two loves: art and football. He longed to turn professional, and in 1950 Sunderland invited him to a trial. He was not taken on.',
      'From his early thirties he worked as a groundsman for Durham County Council. A poster for a drawing class at Gateshead Technical College, under Wilfred Taylor, would change everything.',
    ],
    quote: {
      text: 'I wanted to be a famous inside left, but that just didn’t happen.',
      source: 'Charlie Rogers',
    },
  },
  {
    kind: 'plate',
    image: '/paintings/web/page_035_img_000.jpg',
    alt: 'A snow-covered Tyneside street under a smoking sky by Charlie Rogers',
    caption: 'The streets he would spend a lifetime painting',
  },
  {
    kind: 'cta',
    eyebrow: 'End of the sample',
    heading: 'Read on',
    paragraphs: [
      'This is the opening of the first chapter. The full book runs to 123 pages, with more than a hundred paintings, photographs of the streets before they fell, tribute essays, and a fifty-year memoir from the collector Dennis Donnelly.',
    ],
  },
]
