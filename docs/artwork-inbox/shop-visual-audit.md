# Shop visual audit

Rendered-state review of `/shop` against `docs/DESIGN.md` and `CLAUDE.md`.
Judged from screenshots and measured DOM values, not from reading the source.

Date: 18 September 2026
Reviewer: Claude (subagent), on behalf of Tom

## How this was produced

- `pnpm install` succeeded (pnpm 10.33.0, no errors).
- `next build` succeeded. All checks below were run against the **production**
  build served by `next start`, not the dev server, so there is no dev overlay
  or dev-only warning noise in any capture.
- Supabase env vars were deliberately left unset, so `/shop` renders its
  degraded "opening soon" state. That is what a visitor sees today.
- Browser: Chromium via Playwright 1.56.1, headless.
- Accessibility: axe-core 4.x injected into the live page, plus manual contrast
  maths, a keyboard tab walk, and a landmark and heading inspection.
- Nothing in the application code was changed.

Everything described below was actually observed. Where a point is a
source-level concern that does **not** appear in the screenshots, it is labelled
as such.

## Screenshots

All in `docs/artwork-inbox/screens/`.

| File | What it shows |
| --- | --- |
| `shop-desktop-1440x900.png` | `/shop` degraded state, 1440 wide |
| `shop-mobile-390x844.png` | `/shop` degraded state, 390 wide |
| `shop-mobile-menu-open.png` | `/shop` with the mobile nav overlay open |
| `shop-desktop-focus-state.png` | Keyboard focus ring on a header link |
| `home-desktop-1440x900.png` | `/` at 1440, the reference for the design language |
| `home-mobile-390x844.png` | `/` at 390 |
| `book-desktop-1440x900.png` | `/book` at 1440, the commerce-adjacent benchmark |
| `book-mobile-390x844.png` | `/book` at 390 |
| `work-desktop-1440x900.png` | `/work` at 1440 |
| `work-mobile-390x844.png` | `/work` at 390 |
| `shop-notfound-desktop-1440x900.png` | `/shop/anything-nonexistent` at 1440 |
| `shop-notfound-mobile-390x844.png` | `/shop/anything-nonexistent` at 390 |

## Verdict in one paragraph

The chrome is right and the tokens are right. `/shop` uses the same header,
footer, eyebrow rule, EB Garamond headings and paper background as the rest of
the site, and it breaks none of the square-corner or no-shadow rules. What gives
it away is not styling, it is **structure**: the page abandons the editorial
measure it has just established, centres its only content in a wide dashed box,
and offers the visitor nothing to click. The `/shop/[slug]` not-found route is a
straight-up defect, showing the unbranded Next.js default page inside the site's
own header and footer. That is the thing to fix before a client sees this.

## 1. Does /shop belong to the same site

Mostly yes on surface, no on structure. Concretely, from
`shop-desktop-1440x900.png` against `book-desktop-1440x900.png` and
`home-desktop-1440x900.png`:

**What is right.** Header, wordmark, nav, footer and the book-style breadcrumb
(hairline rule above `CHARLIE ROGERS` in Bensham red at 12px, letter-spaced) are
identical to the rest of the site. The `h1` is EB Garamond at 39.06px, exactly
the same computed size as the `h1` on `/book`. Background is `#FAF6EE`. Nothing
is off-palette.

**What gives it away.**

- **The measure breaks mid-page.** The `h1` and the intro paragraph are both
  608px wide and left-aligned, starting at x=168. The panel directly beneath
  them is **1104px wide**, that is 1.8 times wider, and switches to centred
  text. Every other page on the site holds one column and one alignment down
  the page. `/book` and `/work` both establish a 608px editorial column and keep
  to it. This single jump is the strongest "bolted on" signal in the render.
- **A dashed border.** The panel is `1px dashed #D9D2C0`. Dashed rules appear
  nowhere else on the site and nowhere in `DESIGN.md`, which specifies hairline
  solid rules and colour contrast for separation. A dashed box is the universal
  admin-template convention for "empty state", and it reads exactly like that.
- **An off-token background.** The panel fill is `rgba(242, 235, 220, 0.5)`,
  that is `--paper-warm` at 50 per cent alpha, which resolves to roughly
  `#F6F0E7`. That is not one of the nine colours in `DESIGN.md`. Elsewhere on
  the site, for example the pull-quote band on `/` and the painting mats on
  `/work`, paper-warm is used at full strength.
- **Centred serif body copy.** The panel paragraph is centred EB Garamond. The
  rest of the site sets body copy ragged-right in a left-aligned column. Centred
  multi-line serif is the one typographic move that most says "placeholder".
- **Nothing to click.** Measured: the `<main>` element on `/shop` contains
  **zero** links and **zero** buttons. The copy names two destinations, "the
  book is available to read about, and the full archive of paintings is free to
  browse", and links to neither. `/book` has 9 interactive elements in main,
  `/` has several including two primary buttons. A commerce page that is a dead
  end is the clearest structural difference from every other page here.
- **A mixed apostrophe convention.** The intro renders `Charlie Rogers'` with a
  straight typewriter apostrophe, clearly visible at mobile size in
  `shop-mobile-390x844.png`, where it sits badly against EB Garamond. For
  fairness this is not shop-only: `/` uses `&rsquo;` correctly (`Tyneside's`,
  `aunt's` in `home-desktop-1440x900.png`), while `/shop`, `/book` and `/work`
  all use straight apostrophes. Worth settling site-wide.

## 2. Square corners, no shadows, whitespace, type-led, restrained

Measured across every element on all five pages at both widths:

- **Border radius: 0 violations.** Not a single element on `/shop`, `/`,
  `/book`, `/work` or the 404 has a non-zero computed `border-radius`. Fully
  honoured.
- **Box shadows: 0 violations.** Not a single element on any of the five pages
  has a computed `box-shadow` other than `none`. Fully honoured.
- **Type-led: honoured.** Headings are EB Garamond throughout, eyebrows are
  letter-spaced uppercase sans, and the hierarchy is carried by size and rule
  rather than by boxes or colour blocks. The one exception is the 404, covered
  below.
- **Whitespace: generous, but on `/shop` it has tipped into emptiness.** The
  gap between the bottom of the panel and the top of the footer is **144px on
  desktop and 144px on mobile**. On desktop the whole `<main>` is only 488px
  tall inside a 900px viewport, so the page is almost entirely footer and empty
  paper. On mobile the panel is 224px tall with 144px of nothing beneath it.
  This is not restraint reading as calm, it is a short page that has not been
  laid out for its actual content volume.
- **Restrained hierarchy: one semantic gap.** "The shop is opening soon" is
  rendered at 25px in EB Garamond, that is visually an `h3`, but it is marked up
  as a `<p>`. The only heading on the entire page is the `h1` "Shop". A screen
  reader user navigating by heading gets one stop and then silence, even though
  the page clearly has two levels visually.

## 3. Mobile, 390x844

- **No horizontal overflow on any page.** Measured `scrollWidth` equals
  `clientWidth` (390) on all five routes. Zero elements extend beyond the
  viewport on any page at either width.
- **The panel is over-padded at phone width.** The panel is 342px wide with
  **40px of padding on all sides**, leaving a text measure of only **260px**.
  At 16px that is roughly 36 to 38 characters a line, and because the text is
  centred the four lines form a ragged diamond (see
  `shop-mobile-390x844.png`). The padding does not step down at small sizes.
- **Touch targets, footer nav: below minimum.** Every footer nav link computes
  to **17px tall** at every viewport. WCAG 2.2 target size (minimum, 2.5.8, AA)
  asks for 24 by 24 CSS pixels. Seven links on `/shop` fail this, and the same
  seven fail on `/`, `/book`, `/work` and the 404, so it is a site-wide footer
  issue rather than a shop one.
- **Touch targets, mobile menu: good.** The burger is 46 by 46 with
  `aria-label="Open menu"`. The overlay links are 342 by 60 each. See
  `shop-mobile-menu-open.png`. The overlay is genuinely on-brand: serif at large
  size, hairline rules between items, paper background, no ornament.
- **Nothing is cramped or clipped.** Line height in the panel is 24.8px on a
  16px body, which is comfortable.

## 4. The degraded "opening soon" state

**Dignified, but unfinished, and one route beside it is broken.**

The panel itself is not embarrassing. The copy is plain and honest, there is no
marketing language, no countdown, no email capture, and the tone is right. A
client would not think the site had crashed.

But it will read as unfinished for three reasons, all fixable without touching
the design system:

1. The dashed border and centred text are placeholder grammar, not the site's
   grammar. Solid hairline rule above and below, left-aligned text in the 608px
   column, and it would immediately look intentional rather than temporary.
2. It offers no way onward. Two destinations are named in the sentence and
   neither is a link.
3. There is 144px of dead paper between it and the footer at both widths.

**The bigger problem is the not-found route.** See
`shop-notfound-desktop-1440x900.png`. Visiting `/shop/anything-nonexistent`
correctly returns HTTP 404, and the site header and footer are correctly
inherited, but the body is the **stock Next.js default 404**: the string
"404 | This page could not be found." set in `system-ui` at 24px and 14px,
vertically marooned in a roughly 1000px band of empty paper, with no link back
and no Charlie Rogers typography at all. There is no `not-found.tsx` anywhere in
`app/`. On mobile (`shop-notfound-mobile-390x844.png`) the effect is worse: the
message floats in the middle of a 2976px tall page of blank paper. This is the
single most client-visible defect found, and it is not confined to the shop,
it is what every mistyped URL on the site currently does.

## 5. Heritage first, commerce second

Museum catalogue in its furniture, but the copy oversells in two places.

- The intro reads "Books and fine art prints of Charlie Rogers' work. Each print
  is reproduced from the archive and supports the work of keeping his record of
  Tyneside alive."
- **Prints are promised in the present tense.** `CLAUDE.md` is explicit that
  prints cannot be sold against the low-resolution assets and that the print
  purchase flow must not be enabled. The page currently states prints are on
  sale. Worth softening to what is actually true today.
- **"supports the work of keeping his record of Tyneside alive"** is the one
  sentence on the page doing emotional sell rather than plain description.
  `DESIGN.md` bans marketing language and asks for plain functional copy. Set
  against the tone of `/book`, which simply states publisher, pages, format,
  ISBN and where to buy, this line is the outlier.
- Everything else is right: no badges in the rendered state, no urgency, no
  price shouting, no carousel.

**Source-level note, not visible in these screenshots.** When products do exist,
`components/shop/ProductCard.tsx` renders a "Sold" state as a Bensham-red chip
absolutely positioned over the top-right of the image. `DESIGN.md` under
"Don'ts" says no badges, and the established painting status pattern is a small
colour marker beside an accessible word label, not an overlay chip. The same
component uses an `h3` for the product title on a page whose only other heading
is the `h1`, so a populated shop would skip an `h2` level. Neither is in the
captures because the shop is empty today.

## Accessibility pass, measured

### axe-core results

| Page | Violations | Detail |
| --- | --- | --- |
| `/shop` desktop 1440 | **1** (moderate) | `landmark-unique` |
| `/shop` mobile 390 | **0** | clean |
| `/` desktop 1440 | **1** (moderate) | `landmark-unique` |
| `/book` desktop 1440 | **2** | `aria-hidden-focus` (serious), `landmark-unique` (moderate) |

No `incomplete` results were returned on any page.

- **`landmark-unique` on `/shop`**: there are two `<nav>` elements, one in the
  header and one in the footer, and neither carries an `aria-label`. A screen
  reader user gets two indistinguishable "navigation" landmarks. Fix is two
  labels, for example "Main" and "Footer".
- **`aria-hidden-focus` on `/book`** (serious) is in the book flip component,
  not the shop, but it is the highest-severity finding across the four pages
  audited, so it is recorded here: a focusable element sits inside an
  `aria-hidden` container, which means a keyboard user can tab to something a
  screen reader cannot see.

### Colour contrast, computed from rendered pixels

All 17 distinct text-on-background pairs on `/shop` pass WCAG AA. Lowest
measured values:

| Ratio | Required | Element |
| --- | --- | --- |
| 5.16:1 | 4.5:1 | Footer body, `#6B6860` on `#FAF6EE`, 14px and 12px |
| 8.46:1 | 4.5:1 | Panel paragraph, `#44423D` on the 50 per cent paper-warm fill |
| 9.31:1 | 4.5:1 | Intro copy and header nav, `#44423D` on `#FAF6EE` |
| 9.53:1 | 4.5:1 | Bensham red eyebrow, `#7A1F1F` on `#FAF6EE`, 12px |
| 14.81:1 | 3.0:1 | "The shop is opening soon", 25px |
| 16.31:1 | 3.0:1 | `h1` "Shop" and the wordmark |

**Zero contrast failures.** The `--ink-mute` darkening already recorded in
`DESIGN.md` is holding at 5.16:1.

### Heading order

`/shop` has exactly one heading: `h1` "Shop". No skipped levels, because there
are no other levels. As noted in section 2, the visually-prominent "The shop is
opening soon" is a `<p>` and should probably be an `h2`.

By contrast the 404 page exposes `h1` "404" at **24px in system-ui** and `h2`
"This page could not be found." at **14px in system-ui**, neither of which is
the site's typeface, and the `h2` is smaller than the `h1` by a long way, which
is its own small hierarchy oddity.

### Landmarks

`/shop` has `header`, `nav` (header), `main`, `footer`, `nav` (footer). All
present and correctly nested. `<html lang="en-GB">` is set. `robots` is
`noindex, nofollow`, matching `docs/SHOP.md`.

**No skip link.** There is no "skip to content" anchor on any page, so a
keyboard user must tab through 8 header links before reaching the content on
every page load.

### Focus visibility

Walked 14 tab stops on `/shop`. Every one of them showed a
`2px solid rgb(184, 132, 44)` outline at `2px` offset. That is the ochre
`#B8842C` focus treatment specified in `DESIGN.md`, applied consistently, with
no `outline: none` anywhere. Captured in `shop-desktop-focus-state.png`. This is
the strongest part of the accessibility picture.

Focus target sizes at the header are 36px tall and comfortable; at the footer
they are the 17px noted above.

### Alt text

`/shop` renders no images in its current state, so there was nothing to check
there. Across `/` and `/work`, **14 of 14 images carry a non-empty `alt`**, and
none is missing the attribute. Values are descriptive, for example "A Tyneside
back street by Charlie Rogers", "Saltwell Park", "Cotfield Street".

## Console errors and failed network requests

Captured per page, per viewport, across the full load.

| Page | Console errors | Page errors | Failed requests | HTTP 4xx/5xx |
| --- | --- | --- | --- | --- |
| `/shop` desktop | 0 | 0 | 0 | 0 |
| `/shop` mobile | 0 | 0 | 0 | 0 |
| `/` desktop | 0 | 0 | 0 | 0 |
| `/` mobile | 0 | 0 | 0 | 0 |
| `/book` desktop | 0 | 0 | 0 | 0 |
| `/book` mobile | 0 | 0 | 0 | 0 |
| `/work` desktop | 0 | 0 | 0 | 0 |
| `/work` mobile | 0 | 0 | 0 | 0 |
| `/shop/anything-nonexistent` desktop | 1 | 0 | 0 | 1 |
| `/shop/anything-nonexistent` mobile | 1 | 0 | 0 | 1 |

The single console error on the not-found route is the browser reporting the
document's own 404 status. That is expected and correct behaviour for a
genuinely missing page, not a fault.

**Clean.** No JavaScript exceptions, no missing assets, no blocked requests, no
font loading failures on any page.

## Images without width and height, and layout shift

- **14 of 14 images across the site carry no `width` and no `height`
  attribute**, and none has a CSS `aspect-ratio` (all compute to `auto`). That
  is 4 on `/` and 10 on `/work`. `/shop` and `/book` render no images today.
- **Measured Cumulative Layout Shift was 0.0000 on all four content pages**
  (`/shop`, `/`, `/book`, `/work`), taken with a `PerformanceObserver` over full
  load plus a scroll to the bottom to trigger the lazy-loaded images.
- That zero is partly real and partly an artefact of testing on localhost, so
  the honest reading splits two ways:
  - On **`/work`**, the ten painting images have their height pinned by CSS
    (every one computes to 199.98px tall with an automatic width), so vertical
    space **is** reserved regardless of when the image arrives. These are safe.
  - On **`/`**, the four images have a **fixed width and an intrinsic height**
    (472px wide by 328.61px, 317.33px wide by 264.17px, 257.83px, 262.59px, all
    different). Nothing reserves that height before the file decodes. Over a
    real network rather than localhost these four will push content down as they
    land. This is the genuine, if modest, layout-shift risk.
- The `PaintingCard` and `ProductCard` components both use a plain `<img>` with
  an explicit lint suppression and a comment deferring `next/image` to a later
  performance pass, so this is a known deferral rather than an oversight. Worth
  noting that a populated `/shop` grid would inherit the same behaviour.

## Suggested order of work

Not implemented, listed for Tom to decide on.

1. Add an `app/not-found.tsx` in the site's own typography with a route back.
   This is the only finding here that looks broken rather than unfinished.
2. Give the "opening soon" panel the site's grammar: solid hairline rules
   instead of a dashed box, left-aligned in the 608px column, full-strength
   paper-warm or no fill at all.
3. Add the two links the copy already promises, to `/book` and `/work`.
4. Correct the intro copy so it does not offer prints for sale today, and drop
   the "supports the work of keeping his record alive" line.
5. Promote "The shop is opening soon" from `<p>` to `<h2>`.
6. Label the two `<nav>` landmarks.
7. Raise footer nav link height to at least 24px (site-wide).
8. Fix the `aria-hidden-focus` violation in the book flip component.
9. Reduce panel padding below the `sm` breakpoint.
10. Add a skip link (site-wide).

## What was not verified

- The **populated** shop, product detail page and admin CMS were not rendered,
  because no Supabase credentials were available. Only the degraded state was
  captured, which is what the brief asked for. Anything said about
  `ProductCard` above is a source-level reading and is labelled as such.
- No performance profiling beyond CLS. No Lighthouse run.
- Only Chromium was tested. No Safari or Firefox rendering check, and no real
  device check.
