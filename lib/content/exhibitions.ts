import type { Exhibition } from './types'

// Selected exhibitions drawn from the book's Exhibition Chronology (pages 116 to 117).
// Marked with royalAcademy or posthumous where applicable.
// This is a representative selection. The complete list is in the book.

export const exhibitions: Exhibition[] = [
  // Royal Academy years
  {
    year: '1967',
    name: 'Royal Academy Summer Exhibition',
    venue: 'Royal Academy of Arts',
    city: 'London',
    note: 'Debut showing: "October morning: Cotfield Street, Gateshead".',
    royalAcademy: true,
  },
  {
    year: '1972',
    name: 'Royal Academy Summer Exhibition',
    venue: 'Royal Academy of Arts',
    city: 'London',
    note: '"Street meeting with snow, Gateshead".',
    royalAcademy: true,
  },
  {
    year: '1975',
    name: 'Royal Academy Summer Exhibition',
    venue: 'Royal Academy of Arts',
    city: 'London',
    note: '"From Shephard\'s, Gateshead".',
    royalAcademy: true,
  },
  {
    year: '1981',
    name: 'Royal Academy Summer Exhibition',
    venue: 'Royal Academy of Arts',
    city: 'London',
    note: '"Church at Felling on Tyne, Gateshead". Met HRH The Prince of Wales at the Midsummer Eve Soiree.',
    royalAcademy: true,
  },

  // Selected lifetime exhibitions
  {
    year: '1965',
    name: 'Three-man exhibition',
    venue: 'Univision Gallery',
    city: 'Newcastle',
    note: 'First exhibition; met Norman Cornish.',
  },
  {
    year: '1966',
    name: 'Group exhibition',
    venue: 'Shipley Art Gallery',
    city: 'Gateshead',
  },
  {
    year: '1967',
    name: 'Royal Society of British Artists',
    city: 'London',
  },
  {
    year: '1968',
    name: 'Scottish Royal Academy',
    venue: 'Royal Scottish Academy',
    city: 'Edinburgh',
  },
  {
    year: '1969',
    name: 'First one-man exhibition',
    venue: 'Whitley Bay Library',
    city: 'Whitley Bay',
  },
  {
    year: '1970',
    name: 'Portal Gallery',
    venue: 'Portal Gallery',
    city: 'London',
  },
  {
    year: '1973',
    name: 'International Drawing Biennial',
    city: 'Middlesbrough',
  },
  {
    year: '1973',
    name: 'Exhibition of 36 paintings',
    venue: 'Shipley Art Gallery',
    city: 'Gateshead',
  },
  {
    year: '1974',
    name: 'Salford Art Gallery',
    venue: 'Salford Art Gallery',
    city: 'Manchester',
  },
  {
    year: '1977',
    name: 'One-man exhibition',
    venue: 'DLI Museum and Arts Centre',
    city: 'Durham',
  },
  {
    year: '1981',
    name: 'Midsummer Eve Soiree',
    venue: 'Royal Academy of Arts',
    city: 'London',
    note: 'Introduced to HRH The Prince of Wales.',
  },
  {
    year: '1985',
    name: 'Upstairs Gallery',
    venue: 'Upstairs Gallery',
    city: 'London',
  },
  {
    year: '1990',
    name: 'Joint Christmas exhibition',
    venue: 'Newcastle Polytechnic Gallery',
    city: 'Newcastle',
    note: 'Showing alongside Norman Cornish, Tom McGuinness, and others.',
  },
  {
    year: '1994',
    name: 'Royal Charity Exhibition',
    venue: 'Laing Art Gallery',
    city: 'Newcastle',
    note: 'Opened by Princess Margaret.',
  },
  {
    year: '2004',
    name: 'Bensham etc.',
    venue: 'Shipley Art Gallery',
    city: 'Gateshead',
    note: 'One-man show, 40 paintings.',
  },
  {
    year: '2010',
    name: 'One-man exhibition',
    venue: 'Bensham Grove Community Centre',
    city: 'Gateshead',
  },
  {
    year: '2016 to 2017',
    name: 'The Ann Rogers Memorial Exhibition',
    venue: 'Low Fell Library',
    city: 'Gateshead',
    note: 'Final lifetime exhibition, dedicated to Ann. Curated by Dennis Donnelly.',
  },

  // Posthumous
  {
    year: '2023',
    name: 'The World of Charlie Rogers',
    venue: 'Come View My Art Gallery',
    city: 'Gateshead',
    posthumous: true,
  },
  {
    year: '2024',
    name: 'Belonging',
    venue: 'Laing Art Gallery',
    city: 'Newcastle',
    note: '"Blackwell Lane, Gateshead, 1981" selected for this group exhibition.',
    posthumous: true,
  },
]
