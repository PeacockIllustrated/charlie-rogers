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

**Inter**, also via `next/font/google`. Stand-in for Futura in UI surfaces. Used for:

- Navigation
- Buttons, form controls
- Metadata and labels (dates, dimensions, statuses)
- Section eyebrows (small caps, letter-spaced, like the book's running heads)
- Tabular content

Note that the book uses Futura for its small-caps running heads ("CHARLIE ROGERS - PURSUED BY BULLDOZERS"). Recreate this with Inter at small size, uppercase, with letter-spacing of around 0.15em. This pattern is the most recognisable carry-over from the book.

## Type scale

Modular scale based on 1.25 (major third). Sizes given in rem with their pixel equivalents.

```
display-1   3.815rem  61px   serif, 500   page hero, very sparing
display-2   3.052rem  49px   serif, 500   section opener heroes
h1          2.441rem  39px   serif, 500   page titles
h2          1.953rem  31px   serif, 500   major sections
h3          1.563rem  25px   serif, 500   subsections
h4          1.25rem   20px   serif, 600   minor headings
body-lg     1.125rem  18px   serif, 400   long-form articles
body        1rem      16px   serif, 400   default body
small       0.875rem  14px   sans, 400    UI, captions
xs          0.75rem   12px   sans, 500    metadata, eyebrows
```

Line heights: 1.15 for display, 1.25 for h1 to h3, 1.55 for body, 1.4 for UI.

## Layout

- Max content width: 72rem (1152px) for editorial pages. Wider for gallery grids.
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

Inter, uppercase, 12px, letter-spacing 0.15em, Bensham red, 1px rule above in `--rule` colour.

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

- **Extant** — sage marker, low emphasis
- **Demolished** — Bensham red, slightly higher emphasis
- **Altered** — ochre marker, medium emphasis

Sage and ochre fail contrast as text on paper (2.76:1 and 3.06:1), so the hue is shown as a small square marker beside the word, and the word itself is set in an accessible ink colour (Bensham red for demolished, which passes at 9.53:1). The marker carries the at-a-glance coding; the label stays legible. This mirrors the book's coloured map dots.

### Buttons

Primary: Bensham background, paper text, 1rem padding x and 0.625rem y, sans 14px medium, no border-radius, no shadow.

Secondary: ink-soft border 1px, ink text, transparent background, same metrics. Hover fills with ink-soft.

Tertiary: text only, underline on hover, ink-soft colour.

### Navigation

Header: sticky, paper background, 1px bottom rule. Wordmark on the left in EB Garamond italic 24px, nav items on the right in Inter small caps 13px. No mega menus.

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
- No on-scroll animations beyond a subtle fade-up for image gallery loads.
- Map interactions are exempted from this restraint when the time comes, because the comparison slider needs to feel direct.

## Don'ts

- No carousels.
- No modals for navigation. Modals only for the painting detail viewer.
- No marketing language ("Discover", "Explore", "Journey"). Use plain functional copy.
- No badges, no "NEW" labels, no countdown banners.
- No autoplaying anything.
- No cookie banner theatrics. Privacy notice, plain text, accept by continuing.
