# Backlog

Field notes and ideas captured during the build, not yet actioned. Tom will say "field note" or similar in conversation; new entries get appended here without being implemented in the same session.

Format: short title, one or two lines of context, date captured.

---

## Captured items

### For Brian Rankin, from the Charlie Rodgers mail folder, 18 Sep 2026

All 40 emails in the folder were catalogued into `docs/artwork-inbox/`. The
items below are gaps in what he has sent, for Tom to raise directly. None are
blocking the shop build; they block real artwork and firm listings.

- **High resolution originals, 8 expired Mail Drop items.** Brian sent several
  batches through Apple Mail Drop, whose iCloud links expired on 3, 7 and 12
  July 2026. Lower resolution copies survive embedded in most of those emails,
  so nothing is lost from the record, but the print quality versions are gone.
  The affected sets are listed under `expiredMailDrop` in
  `docs/artwork-inbox/manifest.json`.
- **The Saltwell Park video is gone entirely.** "Charlie Rogers at Saltwell
  Park video", 12 Jun 2026, was a 60MB .mov sent through Mail Drop. Unlike the
  image sets, no copy of any size survives in the mailbox. Brian asked for it
  on the website, so it has to be resupplied.
- **Dimensions and prices.** Only one painting carries real measurements, Pot
  Pie Bob's at 22 x 21cm original and 30 x 25cm mounted. The rest say TBC or
  leave the heading empty, and no print has a price. The book is the only firm
  price in the folder at £25.
- **Bensham Road, 1970, has two different media.** His print email calls it
  "Oil on paper". His own greeting card caption for the same painting says
  "Watercolour". The image reads as watercolour and ink. Confirm before it
  goes on a product page.
- **Christmas cards or greeting cards.** The subject line says "Greeting Card
  Collection", the attached PDF is titled "Christmas Card Selection", and only
  two of the five designs are snow scenes. Seasonal versus year round is a
  commercial decision, not a typo.
- **Fog on the Tyne lyric.** The Pot Pie Bob's email quotes the lyric in full.
  Third party copyright, needs clearing before it appears on a commercial page.
- **One undated card.** "Cotfield Street, Bensham, Gateshead-on-Tyne" is
  captioned with "????" in place of a year.

### Two new product lines not yet on the site

- **Pursued by Bulldozers special edition**, 16 Sep 2026. 100 copies, £25,
  embossed with the Charlie Rogers roundel and signed by Brian, exclusive to
  the website. No postage, fulfilment terms or deadline stated.
- **Greeting card collection**, 17 Sep 2026. £10 per pack of 5, five designs.
  The PDF carries the rights line "All Charlie Rogers paintings and sketches
  © Charles Rogers Junior", which should appear on the product page.

### Technical follow-ups from the shop audits

- **Authorisation on the shared database.** `requireAdmin()` checks only that a
  user is signed in, and the RLS policies grant writes on
  `auth.role() = 'authenticated'`. On a shared instance that lets any signed-in
  user of any other project write to `charlie_products`. Needs a decision on
  the admin identity model before it can be fixed.
- **Sold status is unreachable and lossy.** The admin form offers only draft
  and published, so saving a sold listing silently demotes it to draft.
- **The enquire call to action has no form behind it.** It currently links to
  /book.
- **aria-hidden-focus on /book.** A focusable element sits inside an
  `aria-hidden` container in the book flip component. Serious severity, and the
  highest found across the four pages audited. Outside the shop, so left alone.
- **Images carry no width and height.** 14 of 14 site-wide, with an existing
  code comment deferring `next/image` to a later pass. CLS measured 0 on
  localhost, which flatters it; expect shift over a real network.

---

## Notes from the init pack chat, pre-build

- **Painting bonus pages.** Page 27 of the book has two unlabelled Newcastle paintings (Quayside left, Bigg Market right) below the 8 labelled Gateshead ones. Include them in the initial seed but note they sit outside the page 26 numbered location set.
- **Original PDF was iOS Notes export.** If Brian Rankin updates the book or supplies new material, the source format may again be quirky. Anticipate rotation issues, smasks, and lack of structured metadata.
- **High-res scans needed for prints.** Cannot start Phase 5 without them. Trigger a conversation with Brian Rankin or Charlie Junior about supply timeline once the rest of the site is shipping.
- **Trevor Ermel licensing.** Photographs in the book are credited but not blanket-licensed for digital use. Confirm before reproducing on the site.
