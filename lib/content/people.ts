import type { Person } from './types'

// Original teaser-depth prose. Facts drawn from PROJECT.md and the book.
// Do not reproduce the book's text. One to two short paragraphs per person.
// Order: family first, then closest collaborators, then collectors and witnesses.

export const people: Person[] = [
  {
    slug: 'ann-rogers',
    name: 'Ann Rogers',
    role: 'Wife',
    years: '1942 to 2015',
    paragraphs: [
      'Born in Haltwhistle, Northumberland in 1942, Ann Henderson met Charlie at the Mayfair Ballroom in Newcastle in 1972. They married the following year. She had worked as a librarian in Haltwhistle and Hexham before moving to Gateshead, where she later held a post at Gateshead Technical College.',
      'Ann was a steady presence through more than four decades of painting. When Charlie held his final exhibition at Low Fell Library in 2016, it was dedicated to her memory. She and Charlie are buried together at Saltwell Cemetery.',
    ],
  },
  {
    slug: 'charlie-rogers-junior',
    name: 'Charlie Rogers Junior',
    role: 'Son and copyright holder',
    years: 'Born 1974',
    paragraphs: [
      'Born in 1974, the year after his parents married, Charlie Junior grew up surrounded by his father\'s work. The family home held paintings in place of photographs; the walls themselves were the family album.',
      'When Brian Rankin knocked on the door of a terraced house in Gateshead on 4 February 2023, it was Charlie Junior who opened it. He guided Rankin through the collection that morning, and the book, the exhibition, and this site all follow from that visit. All artwork by Charlie Rogers is copyright Charles Rogers Junior.',
    ],
  },
  {
    slug: 'pop-rogers',
    name: 'Francis "Pop" Rogers',
    role: 'Father',
    paragraphs: [
      'Charlie\'s father, known always as Pop, was one of his earliest and most repeated subjects. One of Charlie\'s very first paintings was a portrait of Pop asleep, and the sleeping or reading figure recurs throughout the catalogue.',
      'A bottle of Newcastle Brown Ale appears beside Pop in many of these domestic scenes, the painter\'s quiet shorthand for a working man at rest. The Brown Ale became one of the most recognisable signatures in the body of work.',
    ],
  },
  {
    slug: 'aunt-violet',
    name: 'Aunt Violet Gwendoline Woodhead',
    role: 'The person who started it all',
    paragraphs: [
      'In 1964, a knee injury sent Charlie limping down Bensham Road to call on his aunt at 262 Bensham Road. Sitting in her front room with a cup of tea, he looked out at the back lane opposite and decided to paint it. The result was Back Cotfield Street, his first finished work.',
      'Cotfield Street was demolished not long after. Mrs Woodhead\'s front window had, without ceremony, launched a fifty-six-year mission to document Tyneside before the bulldozers arrived.',
    ],
  },
  {
    slug: 'norman-cornish',
    name: 'Norman Cornish MBE',
    role: 'Friend and fellow painter',
    years: '1919 to 2014',
    paragraphs: [
      'Norman Cornish painted the pit villages of County Durham with the same devotion Charlie brought to Tyneside\'s back lanes. A former miner from Spennymoor, he was already an established figure when the two men met at Charlie\'s first exhibition in 1965 and found they had more in common than geography.',
      'They sketched together around each other\'s territory for decades, meeting in pubs and at the Stone Gallery in Newcastle. In 1968 Cornish drew Charlie standing before a Lowry at the Stone Gallery, one of several works the two men made in direct response to each other. Cornish died in 2014; Charlie dedicated work to his memory for years afterwards.',
    ],
  },
  {
    slug: 'brian-rankin',
    name: 'Brian Rankin',
    role: 'Compiler of the book',
    paragraphs: [
      'Brian Rankin runs Come View My Art Gallery on Sheriffs Highway in Low Fell. On 4 February 2023 he knocked on Charlie Junior\'s door and spent a morning being guided through a collection he later described as both unexpected and extraordinary. Hundreds of hours of research and interviews followed.',
      'The result was Charlie Rogers, Pursued by Bulldozers, published by Littlecroft Publishing in 2025. Rankin is also in discussion with Gateshead Council about a Charlie Rogers trail around Saltwell Park and a permanent exhibition at Saltwell Towers. The campaign to place Charlie alongside Lowry and Cornish as the third great chronicler of Northern England is his.',
    ],
  },
  {
    slug: 'dennis-donnelly',
    name: 'Dennis Donnelly',
    role: 'Collector and supporter',
    paragraphs: [
      'An insurance broker from Birtley, Dennis Donnelly first sought out Charlie in 1988 after hearing that St Cuthbert\'s Church on Bensham Bank was to be knocked down. He bought three oils that first evening, returned many times, and over thirty years accumulated around a hundred paintings for himself and placed roughly the same number with others.',
      'In 2016 Dennis curated an exhibition of his collection at Low Fell Library in memory of Ann Rogers. Charlie attended and pronounced the display, in his usual register, to "show promise". Donnelly\'s fifty-year memoir of his friendship with Charlie forms one of the centrepieces of the book.',
    ],
  },
  {
    slug: 'trevor-ermel',
    name: 'Trevor Ermel',
    role: 'Photographer',
    paragraphs: [
      'Trevor Ermel was a local photographer working the same Tyneside streets as Charlie during the years of large-scale demolition. Where Charlie painted, Ermel photographed, both men conscious of documenting what would soon be gone.',
      'Throughout the book his black-and-white images are placed alongside Charlie\'s paintings of the same scenes. The pairing underlines the urgency shared by painter and photographer: to catch a place in the moment before it ceases to exist.',
    ],
  },
]
