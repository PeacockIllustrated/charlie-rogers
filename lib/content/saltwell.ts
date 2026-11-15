// Saltwell Park, painted by Charlie over nearly forty years.
//
// From the PDF Brian Rankin sent on 12 November 2026 ("Paul Hutchinson Saltwell
// Park.pdf", scans titled by Paul Wright): 77 pictures, each with Charlie's own
// title. Brian asked for the archive numbers before the titles to come off;
// `n` keeps that number only to name the file, and is never shown.
//
// Titles are Charlie's, with the date he wrote into the title moved to `date`
// so it can be read as a date. Small fixes, all to check with Brian: "Saltell"
// to Saltwell (086), "Gateshead-in-Tyne" to Gateshead-on-Tyne (130), "Jewish
// Conversion" to Conversation (157), capitals on Junior Jazz Bands (129). The
// PDF shows the picture for 119 twice; 117's own picture sat beneath it on the
// page and is used here.

export type Corner = 'towers' | 'gates' | 'lake' | 'band' | 'fair' | 'aviary' | 'views' | 'people'

export interface SaltwellPainting {
  n: string
  title: string
  date: string
  year: number
  corner: Corner
  medium?: string
  width: number
  height: number
}

export const corners: { slug: Corner; label: string }[] = [
  { slug: 'towers', label: 'The Towers and the Grove' },
  { slug: 'gates', label: 'The gates' },
  { slug: 'lake', label: 'The lake and the Dene' },
  { slug: 'band', label: 'The bandstand' },
  { slug: 'fair', label: 'The fair' },
  { slug: 'aviary', label: 'The aviary' },
  { slug: 'views', label: 'Views across the park' },
  { slug: 'people', label: 'People in the park' },
]

export function saltwellSrc(p: SaltwellPainting): string {
  return `/artwork/saltwell/saltwell-${p.n}.jpg`
}

export function saltwellAlt(p: SaltwellPainting): string {
  return `${p.title}, ${p.date}. ${p.medium ?? 'Painting'} by Charlie Rogers.`
}

// In date order, earliest first.
export const saltwellPaintings: SaltwellPainting[] = [
  { n: '096', title: 'Saltwell Park, Gateshead', date: 'June 1979', year: 1979, corner: 'fair', width: 1600, height: 1169 },
  { n: '084', title: 'Saltwell Park', date: '1982', year: 1982, corner: 'views', medium: 'Watercolour', width: 1600, height: 1228 },
  { n: '163', title: 'Old Jew, Gateshead', date: '1984', year: 1984, corner: 'people', medium: 'Watercolour', width: 1600, height: 1282 },
  { n: '167', title: 'Saltwell Park Sketches', date: '1984', year: 1984, corner: 'people', medium: 'Black biro', width: 1600, height: 1158 },
  { n: '104', title: 'Boat Landing, Saltwell Park, Gateshead-on-Tyne', date: '1986', year: 1986, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1101 },
  { n: '168', title: 'Boathouse, Saltwell Park', date: '1986', year: 1986, corner: 'lake', medium: 'Watercolour', width: 1558, height: 1476 },
  { n: '129', title: 'Junior Jazz Bands, Saltwell Park', date: '11 August 1989', year: 1989, corner: 'band', medium: 'Watercolour', width: 1600, height: 1029 },
  { n: '112', title: 'The Hoppings, Gateshead-on-Tyne', date: '22 July 1990', year: 1990, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1119 },
  { n: '109', title: 'Show Wagons, Saltwell Park, Gateshead-on-Tyne', date: '1991', year: 1991, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1102 },
  { n: '108', title: 'Fair at Saltwell Park, Gateshead-on-Tyne', date: '1993', year: 1993, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1161 },
  { n: '110', title: '‘USA Pop Gun’, Saltwell Park, Gateshead-on-Tyne', date: '1993', year: 1993, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1173 },
  { n: '155', title: 'Saltwell Park', date: '1 July 1993', year: 1993, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1118 },
  { n: '153', title: 'Saltwell Park', date: '8 July 1993', year: 1993, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1161 },
  { n: '154', title: 'Building the Waltzer, Saltwell Park', date: '12 July 1993', year: 1993, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1198 },
  { n: '156', title: 'Saltwell Park', date: '3 September 1993', year: 1993, corner: 'views', medium: 'Watercolour', width: 1600, height: 1132 },
  { n: '085', title: 'Towers and Memorial, Saltwell Park, Gateshead-on-Tyne', date: '1994', year: 1994, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1126 },
  { n: '101', title: 'Stalls and Trees, Gateshead-on-Tyne', date: '1994', year: 1994, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1040 },
  { n: '102', title: 'Trees and Stalls, Gateshead-on-Tyne', date: '1994', year: 1994, corner: 'fair', medium: 'Watercolour', width: 1600, height: 1168 },
  { n: '131', title: 'Bandstand and Arches, Saltwell Park, Gateshead', date: '1994', year: 1994, corner: 'band', medium: 'Watercolour', width: 1600, height: 1304 },
  { n: '124', title: 'Saltwell Park, Gateshead-on-Tyne', date: '3 May 1995', year: 1995, corner: 'views', medium: 'Watercolour', width: 1600, height: 1174 },
  { n: '127', title: 'Saltwell Park', date: '28 May 1995', year: 1995, corner: 'views', medium: 'Watercolour', width: 1600, height: 1154 },
  { n: '123', title: 'The Aviary, Saltwell Park', date: '20 June 1995', year: 1995, corner: 'aviary', medium: 'Watercolour', width: 1600, height: 1147 },
  { n: '125', title: 'Budgies, Saltwell Park', date: '19 July 1995', year: 1995, corner: 'aviary', medium: 'Watercolour', width: 1600, height: 1173 },
  { n: '128', title: 'Gents and Aviary, Saltwell Park', date: '20 July 1995', year: 1995, corner: 'aviary', medium: 'Watercolour', width: 1600, height: 1290 },
  { n: '118', title: 'Alderman John Lucas Statue, Saltwell Park', date: '23 August 1996', year: 1996, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1248 },
  { n: '119', title: 'The Grove, Saltwell Park', date: '16 September 1996', year: 1996, corner: 'towers', medium: 'Black biro', width: 1600, height: 1160 },
  { n: '121', title: 'Saltwell Park', date: '10 April 1997', year: 1997, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1205 },
  { n: '122', title: 'Saltwell Park', date: '14 April 1997', year: 1997, corner: 'gates', medium: 'Watercolour', width: 1600, height: 1140 },
  { n: '126', title: 'Saltwell Park, Gateshead-on-Tyne', date: '3 May 1998', year: 1998, corner: 'views', medium: 'Watercolour', width: 1600, height: 1160 },
  { n: '114', title: 'Stacked Boats, Saltwell Park', date: '26 June 1998', year: 1998, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1123 },
  { n: '113', title: 'Boats and Lake, Saltwell Park', date: '2 September 1998', year: 1998, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1129 },
  { n: '158', title: 'Saltwell Park', date: '5 May 2001', year: 2001, corner: 'people', medium: 'Watercolour', width: 1600, height: 1148 },
  { n: '138', title: 'Saltwell Park', date: '5 July 2001', year: 2001, corner: 'people', medium: 'Watercolour', width: 1600, height: 1146 },
  { n: '134', title: 'Saltwell Park Soloist', date: '27 July 2001', year: 2001, corner: 'band', medium: 'Watercolour', width: 1600, height: 1130 },
  { n: '137', title: 'Ice Cream Van, Saltwell Park', date: '25 August 2001', year: 2001, corner: 'people', medium: 'Watercolour', width: 1600, height: 1192 },
  { n: '094', title: 'Saltwell Park, Gateshead-on-Tyne', date: '2002', year: 2002, corner: 'views', medium: 'Watercolour', width: 1600, height: 952 },
  { n: '139', title: 'Carrying Home the Cup. George Pugmire, Gateshead Bowling Champion, Saltwell Park', date: '13 July 2002', year: 2002, corner: 'people', medium: 'Watercolour', width: 1600, height: 1190 },
  { n: '140', title: 'Saltwell Park', date: '16 July 2002', year: 2002, corner: 'lake', medium: 'Pen and wash', width: 1600, height: 1153 },
  { n: '136', title: 'Men under Trees, Saltwell Park', date: '25 May 2003', year: 2003, corner: 'people', medium: 'Watercolour', width: 1600, height: 1132 },
  { n: '157', title: 'Jewish Conversation with Boats, Saltwell Park', date: '6 June 2003', year: 2003, corner: 'people', medium: 'Watercolour', width: 1600, height: 1084 },
  { n: '152', title: 'A Trip from Sunderland, Saltwell Park', date: '28 July 2003', year: 2003, corner: 'people', medium: 'Watercolour', width: 1600, height: 1141 },
  { n: '133', title: 'Listening to the Band, Saltwell Park', date: '3 August 2003', year: 2003, corner: 'band', medium: 'Watercolour', width: 1600, height: 1154 },
  { n: '141', title: 'Saltwell Park, Ann Rogers Seat', date: '3 September 2003', year: 2003, corner: 'people', medium: 'Watercolour', width: 1600, height: 1168 },
  { n: '135', title: 'September', date: '11 September 2003', year: 2003, corner: 'people', medium: 'Watercolour', width: 1600, height: 1134 },
  { n: '161', title: 'Saltwell Park', date: '26 April 2004', year: 2004, corner: 'people', medium: 'Watercolour', width: 1600, height: 1188 },
  { n: '093', title: 'Trees and Towers, Saltwell Park, Gateshead-on-Tyne', date: 'November 2004', year: 2004, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1117 },
  { n: '103', title: 'The Avenues and Saltwell Park, Gateshead-on-Tyne', date: 'February 2005', year: 2005, corner: 'views', medium: 'Watercolour', width: 1600, height: 933 },
  { n: '117', title: 'Bandstand, Towers and Angel, Saltwell Park, Gateshead-on-Tyne', date: 'March 2005', year: 2005, corner: 'band', medium: 'Watercolour', width: 1600, height: 1135 },
  { n: '090', title: 'Bridges in the Dene, Saltwell Park, Gateshead-on-Tyne', date: 'April 2005', year: 2005, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1120 },
  { n: '091', title: 'Turret, Arches and Angel, Saltwell Park, Gateshead-on-Tyne', date: 'April 2005', year: 2005, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1121 },
  { n: '095', title: 'Trees and Towers, Gateshead-on-Tyne', date: 'April 2005', year: 2005, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1118 },
  { n: '099', title: 'Towers and Arches, Saltwell Park, Gateshead-on-Tyne', date: 'June 2005', year: 2005, corner: 'towers', width: 1600, height: 1117 },
  { n: '130', title: 'Saltwell Park, Gateshead-on-Tyne', date: 'July 2005', year: 2005, corner: 'views', medium: 'Watercolour', width: 1600, height: 1089 },
  { n: '082', title: 'Artist in Saltwell Park (Steven Lion Bowes), VE Day', date: '2 September 2005', year: 2005, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1407 },
  { n: '132', title: 'Misty Solo, Trimdon Band, Saltwell Park', date: '30 September 2005', year: 2005, corner: 'band', medium: 'Watercolour', width: 1600, height: 1115 },
  { n: '086', title: 'Trees and Towers, Saltwell Park, Gateshead-on-Tyne', date: 'November 2005', year: 2005, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1126 },
  { n: '107', title: 'Saltwell Park Gates', date: '2006', year: 2006, corner: 'gates', medium: 'Watercolour', width: 1600, height: 875 },
  { n: '116', title: 'Old Saltwell, Bridges, Saltwell Park, Gateshead-on-Tyne', date: 'April 2006', year: 2006, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1119 },
  { n: '100', title: 'Saltwell View, Gateshead-on-Tyne', date: 'November 2006', year: 2006, corner: 'views', medium: 'Watercolour', width: 1600, height: 1104 },
  { n: '087', title: 'Saltwell Towers from the Grove, Gateshead-on-Tyne', date: '2007', year: 2007, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1116 },
  { n: '098', title: 'Lake at Saltwell Park, Gateshead-on-Tyne', date: 'January 2007', year: 2007, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1114 },
  { n: '083', title: 'Saltwell View, Gateshead-on-Tyne', date: '2009', year: 2009, corner: 'views', medium: 'Watercolour', width: 1600, height: 872 },
  { n: '105', title: 'Saltwell Park, Gateshead-on-Tyne', date: 'December 2009', year: 2009, corner: 'views', medium: 'Watercolour', width: 1600, height: 1109 },
  { n: '115', title: 'Trees and Turrets, Saltwell Park', date: 'December 2009', year: 2009, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1118 },
  { n: '142', title: 'Saltwell Park', date: '10 March 2010', year: 2010, corner: 'lake', medium: 'Watercolour', width: 1600, height: 1115 },
  { n: '144', title: 'Saltwell Park', date: '26 May 2010', year: 2010, corner: 'band', medium: 'Watercolour', width: 1600, height: 1214 },
  { n: '145', title: 'Rose Garden, Saltwell Park', date: '20 June 2010', year: 2010, corner: 'views', medium: 'Watercolour', width: 1600, height: 1186 },
  { n: '143', title: 'Saltwell Park', date: '5 September 2010', year: 2010, corner: 'band', medium: 'Watercolour', width: 1600, height: 1075 },
  { n: '162', title: 'Snow Scene, Gateshead', date: '3 December 2010', year: 2010, corner: 'people', medium: 'Watercolour', width: 1600, height: 1151 },
  { n: '166', title: 'April Sunday, Saltwell Park', date: '10 April 2011', year: 2011, corner: 'people', medium: 'Watercolour', width: 1600, height: 1106 },
  { n: '165', title: 'Jewish Outing', date: '12 April 2011', year: 2011, corner: 'people', medium: 'Watercolour', width: 1600, height: 1222 },
  { n: '146', title: 'Jewish Springtime, Gateshead', date: '26 April 2011', year: 2011, corner: 'people', medium: 'Watercolour', width: 1600, height: 1164 },
  { n: '088', title: 'Saltwell Park Gates and Flags, Gateshead-on-Tyne', date: 'October 2014', year: 2014, corner: 'gates', medium: 'Watercolour', width: 1600, height: 1139 },
  { n: '089', title: 'Saltwell Park Gates, Gateshead-on-Tyne', date: 'October 2014', year: 2014, corner: 'gates', medium: 'Watercolour', width: 1600, height: 1138 },
  { n: '111', title: 'Park Gates, Saltwell, Gateshead-on-Tyne', date: 'February 2015', year: 2015, corner: 'gates', medium: 'Watercolour', width: 1600, height: 1126 },
  { n: '106', title: 'Saltwell Park, Gateshead-on-Tyne', date: 'June 2016', year: 2016, corner: 'views', medium: 'Watercolour', width: 1600, height: 1121 },
  { n: '092', title: 'Saltwell Towers, Gateshead-on-Tyne', date: '2017', year: 2017, corner: 'towers', medium: 'Watercolour', width: 1600, height: 1128 },
]
