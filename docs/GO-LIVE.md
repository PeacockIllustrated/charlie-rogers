# Go-live readiness, 29 September 2026

## Update, 7 October 2026

Since this check was written, main has moved on:

- The redesign (#5) added a page per painting at `/catalogue/<slug>`. The
  sitemap now lists them.
- The shop is checkout-ready (#6). The basket, checkout, orders and the admin
  Orders and Settings screens are on main, and the orders migration has been
  applied to the live database. The checkout stays closed until it is opened
  at `/admin/settings`; payment is by arrangement until Stripe is added. See
  `SHOP.md`.
- `/book` already shows £25 and `metadataBase` is already set on main, so
  those two fixes from this pass were dropped in the merge.

Blocker 1 below is therefore down to opening the checkout once UK postage and
the order email are set. Blockers 2 to 4 still stand: the shop is still
unlinked and noindex, the two migrations under blocker 3 should be checked on
the live database, and the special edition photograph still needs uploading.

Checked against the docs in this folder, the live deployment on
www.charlierogers.art, and every message from Brian Rankin in Outlook. Nothing
new has arrived from Brian since 18 September; the full reconciliation of his
40 earlier messages is in `docs/artwork-inbox/brian-spec-audit.md` and still
holds.

## Verdict

**The archive is ready. The shop is not.** The heritage half of the site
(story, work, places, people, timeline, exhibitions, book) builds cleanly,
passes typecheck and tests, follows the house rules, and is already being
served on the production domain. Nothing on it can take money or an enquiry,
and the one product Brian wants for launch, the special edition, cannot be
bought.

## Blockers for launch

These stop Brian's launch product from being sold. They need Tom, not code.

1. **No way to buy anything.** There is no Stripe checkout, and
   `NEXT_PUBLIC_ENQUIRY_EMAIL` is not set on Vercel, so every live product page
   ends "There is no online checkout yet, and no enquiry address has been set."
   The fastest route to launch is to set that variable and redeploy; enquiries
   then work by email the same day. Stripe Checkout is the proper fix and is
   Phase 3 in `ROADMAP.md`, but it needs answers first: postage and packing,
   UK only or overseas, and who fulfils (Brian from Low Fell, or Tom).
2. **The special edition is "exclusive to this website" and the website does
   not link to it.** `/shop` is deliberately unlinked and `noindex` while it is
   a test surface (`SHOP.md`). Opening it means adding it to the header and
   footer, dropping the `noindex`, and adding it to `app/sitemap.ts` and
   `app/robots.ts`. Do that in the same change that makes it purchasable, not
   before, or visitors land on a dead end.
3. **The live database is behind the code.** The live special edition page
   is missing Brian's book description and his "exclusive to this website"
   line, and Pop and the greeting cards show "Image to come". Two migrations
   need running against the live instance, in order:
   - `supabase/migrations/20260924071500_charlie-shop-copy-corrections.sql`
   - `supabase/migrations/20260929090000_charlie-shop-missing-images.sql`

   Both are guarded and safe to run twice. The Supabase connector available to
   Claude does not reach the instance the site uses, so this has to be run from
   the Supabase dashboard's SQL editor.
4. **No photograph of the special edition.** Brian sent `IMG_4874.jpeg` (the
   embossed roundel and signature) on 16 September. It is still in the
   mailbox. Upload it through `/admin` once the migrations are in.

## Brian's requests, status

| Request | Status |
| --- | --- |
| Book for sale, £25 | On `/book` as a price; not purchasable (blocker 1) |
| Special edition, 100 copies, £25, exclusive to the site | Listed in the shop; not linked or purchasable (blockers 1 to 4) |
| Greeting card pack, £10 for 5, A6 | Listed; images pending migration (blocker 3) |
| Nine prints | Listed as price on application; correctly not purchasable, files are not print quality |
| Print specifications, Paul Wright at the Biscuit | Done |
| Talks by Brian | Done, on `/exhibitions` |
| Saltwell Towers and library exhibitions, QR codes | Done, on `/exhibitions` |
| Saltwell Park video | Not possible; Mail Drop expired, he has to resend |
| Collection sheet, 18 September | Arrived without its attachment; he has to resend |
| A3 prints | Held back; only Town Moor has the pixels for A3 |
| Prints introduction copy | Held back; his text is cut off mid-sentence |
| Framed or tubed options, room mock-ups | Not built; no variant model, uncosted |
| Mark Ferguson MP clip | Not on the site; a decision, not a task |

## Questions for Brian before launch

Carried over from `BACKLOG.md`, cut to the ones that block launch day:

- Postage and packing for the book and the cards, and who posts them.
- Enquiry address to publish (his, or a site address).
- Christmas cards or year-round greeting cards.
- Resend the collection sheet and the Saltwell Park video, as direct files.

## Fixed in this pass

- No `robots.txt` or `sitemap.xml`. Added. The sitemap
  covers the public archive only, and robots keeps crawlers off `/shop`,
  `/styleguide`, `/admin` and `/api`.
- The missing-images migration above.

## Not blocking, worth doing soon

- **Sentry and Resend are not installed.** `CLAUDE.md` lists both as
  non-negotiable. Resend only matters once there are orders; Sentry matters from
  day one of a public site.
- **No favicon.** Browsers show a blank tab icon.
- **No OpenGraph images.** Links shared on Facebook, which is where Brian's
  audience is, show no picture.
- **Images carry no width and height.** Expect layout shift on slow networks.
- **An `aria-hidden` focus bug on `/book`** in the page flip component, found
  in the earlier audit.
- **Historic map overlay** is off until the National Library of Scotland
  licence is settled (`MAP.md`). Correctly off.
