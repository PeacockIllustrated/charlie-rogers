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

### For Brian Rankin, from the email reconciliation, 24 Sep 2026

Raised by the full audit of all 40 archived messages against the live copy.
Working detail is in `docs/artwork-inbox/brian-spec-audit.md`.

- **A3 prints against the files we hold.** His 18 September message says "The
  prints will be A3 size". A3 is 42cm on the long edge. Of the nine paintings,
  only Town Moor reaches it. Bigg Market gets to 30cm, five reach 16 to 17cm,
  Pop 15cm and Third Street 5cm. His own 9 June email also gives Pot Pie Bob's
  a "Mounted print- 30 x 25cm", eight days earlier and more specific. Either he
  supplies originals at A3 resolution or the stated size comes down. A3 is held
  unrendered in `statedPrintSize` until he settles it.
- **The missing attachment.** The same message says "Can we include this on the
  website to confirm the images available for both the print and greeting card
  collections". Outlook reports no attachment on it. Nobody can confirm which
  paintings make up each collection until he resends whatever "this" was.
- **The card designs are proofs, not artwork.** The five images inside the
  Christmas Card Selection PDF measure 1622px on the long edge for the Monument
  and roughly 635px for the other four. A6 at 300dpi needs 1748px. They are
  wired into the product page because they are the only record of what is in
  the pack, but none of them can be printed. Originals needed.
- **The prints introduction is unfinished.** His 6 June copy breaks off mid
  sentence at "during the second half of the twentieth", and promises "the
  bustling streets of Paris" when no Paris painting is in the collection. The
  shop currently carries site-written copy instead.
- **Two media stated for Bensham Road 1970.** "Oil on paper" on 8 June, then
  "Watercolour" on the card caption of 17 September. The site follows the card
  caption. Worth one line from him to close it.
- **Two purchase options per print.** "A similar contemporary black frame or
  alternatively a single print delivered in a tube", with room mock-ups. There
  is no variant concept in the data model. Real scope, uncosted.
- **Glazed items from the gallery only?** He asked the question on 9 June and
  it was never answered. It decides fulfilment.
- **The Joke Shop quotation.** The closing line "gone but not forgotten" is
  unattributed and appears nowhere else. Left off the page until he names the
  speaker.
- **Product photography for the two priced products.** The special edition is
  the only thing on the site that could take money today, and there is no
  picture of the embossed, signed copy a buyer receives. `IMG_4874.jpeg` is
  still sitting in the mailbox.

### Technical follow-ups from the shop audits

- ~~**Authorisation on the shared database.**~~ **Done, 18 Sep 2026.** Writes
  now require membership of `charlie_admins`, tested through
  `charlie_is_admin()`, in both `requireAdmin()` and every RLS policy. Applied
  to the live instance and verified there. See
  `supabase/migrations/20260918090000_charlie-shop-admin-authz.sql`.
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
