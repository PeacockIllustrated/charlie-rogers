# Design system

## Brief

Modern with heritage roots. The book *Pursued by Bulldozers* is the principal reference: Bembo serif body, Futura sans display, deep wine red accents, generous white space, restrained layout. The website should feel like the book has been gently translated to screen, not redesigned away from it.

Charlie's palette is the secondary reference. His paintings are watercolour and pen wash on aged paper: brick reds, slate skies, ochre stonework, mossy foliage, black ink outlines. The site's chrome should feel like it could sit next to one of his paintings without competing.

## Palette

Earthy, slightly desaturated, paper-warm. No neon, no pure white, no pure black.

```css
/* Tailwind theme.extend.colors */

--paper:        #FAF6EE;  /* aged paper, primary background */
--paper-warm:   #F2EBDC;  /* slightly warmer paper for cards, alternating sections */
--ink:          #1A1916;  /* deep charcoal, primary text */
--ink-soft:     #44423D;  /* secondary text */
--ink-mute:     #6B6860;  /* tertiary text, metadata. Darkened from #7A776E, which failed WCAG AA on paper at 4.15:1; this is 5.16:1. */
--rule:         #D9D2C0;  /* hairline dividers */

/* Accent: Bensham red, from the book's headers and marker dots */
--bensham:      #7A1F1F;
--bensham-deep: #5E1414;  /* hover, active */

/* Secondary accents, lifted from Charlie's work */
--slate:        #4A5B6E;  /* Tyneside sky grey-blue */
--ochre:        #B8842C;  /* warm Northumbrian stone */
--sage:         #8B9B7A;  /* faded foliage */
--brick:        #A85842;  /* aged terracotta brick */
```

Backgrounds default to `--paper`. Hero or feature sections may alternate with `--paper-warm` to break the page rhythm. Never use pure white (`#FFF`) or pure black (`#000`).

The Bensham red is precious. Reserve it for: section heads in the book-style breadcrumb, primary CTAs, location markers on the map, and the brand wordmark. Do not use it for body links or chrome.

## Typography

Two typefaces, both free, both close to the book's actual specimens.

### Serif (display, body)

**EB Garamond**, served via `next/font/google`. The closest free clone of Bembo's proportions. Used for:

- All headings
- Article body, biographical text, painting descriptions
- Pull quotes
- Captions in italic

```ts
import { EB_Garamond } from 'next/font/google'

export const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})
```

### Sans (UI, navigation, metadata)

**Jost**, via `next/font/google`, weights 400 and 500. An open source Futura revival, so the running heads now carry the same geometric letterforms as the book's own Futura. It replaced Inter in October 2026. Used for:

- Navigation
- Buttons, form controls
- Metadata and labels (dates, dimensions, statuses)
- Running heads: 12px, uppercase, letter-spacing 0.16em, Bensham red
- Tabular content

Figures: prose uses oldstyle proportional figures, set on `body`. Anything in the sans uses lining tabular figures (`.font-sans` in globals.css), so dates line up in ledgers and on the race line. Large display years (1964, the decade heads on /work) set lining figures inline.

Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## Type scale

Seven hand-set steps, with tracking per band. Legacy names map onto the steps so older markup lands on one (see tailwind.config.ts).

```
display  88px  clamp(3.25rem, 7.4vw, 5.5rem)   lh 0.98  -0.02em  page titles, home hero
h1       49px  clamp(2.375rem, 4.6vw, 3.0625rem) lh 1.08  -0.01em  section openers, pull quotes
h2       31px  1.9375rem                       lh 1.2   -0.005em
lead     23px  1.4375rem                       lh 1.42           introductions (also h3)
body     19px  1.1875rem                       lh 1.6            reading text (also h4, body-lg)
ui       14px  0.875rem (small)                lh 1.45  0.01em   buttons, notes
label    12px  0.75rem (xs)                    lh 1.4   0.16em when uppercase
```

Motion has three durations: `colour` 120ms for hover colour, `fade` 220ms, `sheet` 360ms for anything that moves. Easing `out` is cubic-bezier(.2,.7,.2,1).

## Layout

- Max content width: 76rem (1216px).
- Page opening: running head and display title in seven columns of twelve, the introduction hung in the remaining five and aligned to the title's foot (`SectionHeading as="h1"`).
- The rail: section labels hang in the left three columns, content in the right nine, as the book hangs chapter heads in its margin.
- Article body column: 38rem (608px). Optimum reading width.
- Generous vertical rhythm. Section spacing is 6rem to 8rem on desktop, 3rem to 4rem on mobile.
- 12-column grid where useful, but most content surfaces are simpler (single column with optional sidebar metadata).
- Square corners everywhere. No `rounded-*` unless documented justification.
- No drop shadows. Use hairline rules and colour contrast for separation.

## Components

### The book breadcrumb

Recreate the book's running head style for the site's section indicator. A thin hairline rule above a small-caps line in Bensham red.

```
─────────────────────────
CHARLIE ROGERS · GATESHEAD
```

Jost, uppercase, 12px, letter-spacing 0.16em, Bensham red, 1px rule above in `--rule` colour.

### Painting card

The primary content surface across the site. Used in galleries, location pages, search results.

```
┌─────────────────────┐
│                     │
│   [painting image]  │
│                     │
└─────────────────────┘
COTFIELD STREET · 1973
Pen and wash on paper
Demolished
```

- Image: native aspect ratio, no cropping. White ish paper margin around it.
- Title: serif, weight 500, size body-lg.
- Metadata line 1 (location, year): sans small caps, ink-soft.
- Metadata line 2 (medium): serif italic, ink-mute.
- Status badge if demolished: Bensham red, sans 12px, no border.

No card frame, no shadow. Whitespace does the separating.

### Painting status

Three states, displayed as a small label not a chip:

- **Extant**, sage marker, low emphasis
- **Demolished**, Bensham red, slightly higher emphasis
- **Altered**, ochre marker, medium emphasis

Sage and ochre fail contrast as text on paper (2.76:1 and 3.06:1), so the hue is shown as a small square marker beside the word, and the word itself is set in an accessible ink colour (Bensham red for demolished, which passes at 9.53:1). The marker carries the at-a-glance coding; the label stays legible. This mirrors the book's coloured map dots.

### Buttons

Primary: Bensham background, paper text, 1rem padding x and 0.625rem y, sans 14px medium, no border-radius, no shadow.

Secondary: ink-soft border 1px, ink text, transparent background, same metrics. Hover fills with ink-soft.

Tertiary: text only, underline on hover, ink-soft colour.

### Navigation

Header: sticky, paper background, 1px bottom rule. The roundel and a wordmark in EB Garamond italic 23px on the left, nav items on the right in Jost, uppercase, 12px. No mega menus.

Mobile: hamburger reveals a full-screen overlay in paper, nav items stacked, serif 28px.

### Forms

Inputs: 1px solid ink-mute border, paper background, 0.75rem padding, no border-radius. Focus state replaces border with ink and adds a 2px offset outline in ochre.

## Imagery

- Charlie's paintings should always be displayed against a paper or paper-warm background, never against pure white. Their watercolour quality reads better with warmth around them.
- Photographs (Trevor Ermel's, historical archive shots) should be presented in their original black and white without filters.
- No filters, no overlays, no Instagram-style treatments. The work is the work.

## Motion

Reduce on principle. The site is about quiet observation.

- Cross-fades on image transitions, 200ms ease-out.
- No parallax scrolling.
- On-scroll motion is limited to one subtle fade-up as an element first enters the viewport. It was originally allowed for image gallery loads only. It now also covers the Timeline page, decided September 2026: a chronology is the one surface where a reveal carries meaning, because it makes reading the page feel like moving through the years rather than down a list. The terms are unchanged and the restraint is the point. One pass per element, 200ms ease-out, 0.5rem of travel, opacity and transform only, never replayed on scroll back, and nothing else on the page moves.
- Smooth scrolling is allowed where a page carries in-page jump links, currently the Timeline era navigation. It is scoped to that page; elsewhere the browser default stands.
- Scroll-linked progress indicators are allowed where a page is long enough that the reader can lose their place, currently the Timeline spine, decided September 2026. The hairline rule running down each era thickens to 3px in `ink-soft` behind the reader, so the line doubles as a position indicator for the chronology. Treat it as a reading instrument rather than decoration, and hold it to these terms: it moves only in step with the reader's own scrolling, it never runs on a clock of its own, it settles the instant scrolling stops, it is an overlay so that thickening it cannot shift the entries sideways, and it carries no information that is not already in the page. `ink-soft` and not Bensham red, which stays reserved for the uses listed under Palette.
- Map interactions are exempted from this restraint when the time comes, because the comparison slider needs to feel direct.

Two rules apply to every animation on the site, without exception.

1. It must answer `@media (prefers-reduced-motion: reduce)`. For anything decorative that means switching it off outright. Follow the precedent in `app/globals.css`: a named keyframe, a duration, and a reduce block that sets `animation: none`.
2. Content must never depend on an animation having run in order to be visible. A reveal is an enhancement layered on top of markup that is already readable with JavaScript off, with motion off, and in print. If in doubt, load the page with scripting disabled and check that nothing has vanished.

One qualification to the first rule, added September 2026 when the Timeline progress indicator was built. Switching a functional indicator off under reduced motion would take away information the reader was relying on, which is not the same favour as taking away decoration. So an indicator keeps working under reduce, but it stops sliding: the Timeline spine advances in discrete steps instead, one jump per entry in the era, measured at exactly a quarter of the spine per entry in a four-entry era. Nothing glides, and the reader still knows where they are. This qualification covers indicators only. Anything decorative is still switched off outright, and the safety net in `app/globals.css` that kills animation and transition durations across the Timeline page continues to do so for everything except the indicator.

Both Timeline behaviours degrade to plain markup. The progress indicator is a CSS scroll-driven animation (`animation-timeline: view()`), so it needs no JavaScript at all in a browser that supports it, and `components/timeline/TrackFallback.tsx` drives the same transform from a passive, requestAnimationFrame-throttled scroll listener where support is missing. With neither, the spine simply stays the hairline it has always been.

## Surfaces

Three flat planes, separated by tone and a 1px `--rule` edge, never by shadow or radius:

- **Page**: `--paper`. Headings, reading text and the hung paintings.
- **Panel**: `--paper-warm`, full width or boxed. Holds a group: the race on the home page, the places list, the catalogue ledger, the chapter index, the untitled strand, the book's special edition.
- **Card**: `--paper` with a rule edge, set on a panel or the page. One object each: a catalogue entry (`CatalogueCard`), a place in the race (`RaceRow`), a Lowry, Cornish or Rogers column. Hover darkens the edge to `--ink-mute`.

A coloured 2px top edge marks a card's kind where it helps, such as the place tallies (red, ochre, sage) or the special edition (red). Paintings keep their mount, now with a rule edge so the mount reads as a board on the page.

Every page now follows this: chapters on the story page and eras on the timeline alternate between page and full-width panel; exhibitions, people, the shop and the product pages put their lists on panels and their items on cards; the closing book callout is a panel with a red top edge. Introduced in October 2026 after Tom noted the first redesign left too much content sitting straight on the page.

## Signature devices

### The mount

Every painting sits on `--mount` (#F4EEE2), a board colour used for paintings and nothing else. The mount is bottom-weighted (6% sides and top, 9% bottom), as a framer cuts it. `components/Plate.tsx`.

Images are never drawn wider than their native pixels. A 245px book plate stays a small plate on a generous mount rather than being stretched into blur. next/image serves AVIF or WebP at the sizes each layout asks for, never above the source.

### The race line

The site's own device, built from the book's thesis. One axis from 1964 to 2020, the span of Charlie's painting life. A square ink mark for each dated painting of a place; what follows the last mark says what became of it:

- demolished: a Bensham red line to the year it came down, ending in a tick. With the year unconfirmed the line is dashed and runs off the end with no tick, saying gone without claiming when.
- altered: an ochre dashed line to the present.
- standing: a sage line to the present.

The drawing is decorative; its caption carries the same facts in words. `components/RaceLine.tsx`. Demolition years go in `Place.cleared` only once confirmed against clearance records.

### The roundel

The mark, from the blind-embossed roundel on the special edition: "CHARLIE ROGERS · 1930 TO 2020 · GATESHEAD" round a ring, CR in italic Garamond at the centre. The circle is the one deliberate curve on the site. It is the shape of the emboss, drawn in SVG, not a softened corner, so the square corners rule stands. Used in the header, the book pages, the footer, product cards with no photograph yet, and the icons. `components/Roundel.tsx`.

### The catalogue

Each named painting has a page at /catalogue/[slug] with a plate, a ledger (`components/Ledger.tsx`), its place's race line, a paired photograph where the book prints one, and a share image drawn from the painting itself. Entries live in `lib/content/catalogue.ts`, and each records where its title came from. Untitled book plates appear in their chapter under "Reproduced in the book", captioned by page, at native size.

## Graphics in motion

Pen and wash drawings made for the site in Charlie's manner, never passed off as his: wandering ink lines that overshoot at corners (`lib/sketch.ts`, seeded so server and browser agree), colour washed in afterwards and never quite inside the lines, and a turbulence filter for the bleed. Each one sits where it tells part of the story, and each moves slowly:

- **Snow over Bensham Road** on the home page, over the painting itself, because it is a snow scene.
- **The race** (`Demolition`) on the home and places pages: a bulldozer works along a terrace, shoving each house in turn: the house shakes, its chimney topples, the front folds down into a cloud of brick dust, bricks arc out and land on a rubble heap, and the dozer moves on to the next. Meanwhile a man in a flat cap paints the last of the row at his easel. The cycle takes 30 seconds, then the street is drawn again.
- **The view from the window** (`BackLane`) in the 1964 section: the back lane from 262 Bensham Road, framed as a sash window. Its lines draw themselves in when it scrolls into view, in the order a sketch is built (yard walls, the house backs and stacks behind, gates and setts, then people). Washing sways on the line, the cat on the wall flicks its tail, the gas lamp glows, the man and his dog walk away up the lane. The caption says it was drawn for the site and that Charlie's painting has not been found.
- **The street** (`Skyline`) at the top of every footer: a Tyneside street at dusk, cut freehand in Bensham deep red over a paler far row of roofs that drifts slower than the page. As it scrolls into view the windows light one by one, and a lamplighter walks the pavement lighting each gas lamp as he reaches it. There is also a chapel spire, a swinging pub sign, aerials, pigeons and smoke. The footer below is one deep red block: the book, then the wordmark and the archive links.

With `prefers-reduced-motion` the smoke, snow and dust are removed, and every drawing shows complete and at rest, with the bulldozer halfway along the street.

## Don'ts

- No carousels.
- No modals for navigation. Modals only for the painting detail viewer.
- No marketing language ("Discover", "Explore", "Journey"). Use plain functional copy.
- No badges, no "NEW" labels, no countdown banners.
- No autoplaying anything.
- No cookie banner theatrics. Privacy notice, plain text, accept by continuing.
