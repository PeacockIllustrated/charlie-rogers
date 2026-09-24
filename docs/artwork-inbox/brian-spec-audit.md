# Brian Rankin's spec, against what the site says

Reconciliation carried out 24 September 2026. Source of truth is
`emails-a.json`, `emails-b.json` and `emails-c.json` in this directory, which
carry the verbatim body text of all 40 messages in the `Charlie Rodgers` mail
folder, plus one later message read directly from Outlook and quoted below.
Compared against `lib/shop/catalogue.ts` and `supabase/seed-shop.sql`.

Every assertion below is traceable to a quoted line of Brian's. Where he is
ambiguous or contradicts himself, it is left for Tom rather than resolved here.

---

## 1. One message arrived after the archive was built

**"Website: The print and card collections", 18 September 2026, 12:07.**

> Hi Tom
>
> Can we include this on the website to confirm the images available for both
> the print and greeting card collections.
> The prints will be A3 size, the cards will be A6 size.

Two things follow from it.

**The message has no attachment.** "Can we include **this**" points at
something that did not arrive. Outlook reports `hasAttachments: false` and an
empty attachment list. Whatever he meant to send, confirming which images are
in each collection, is not in the mailbox. It needs asking for again, and until
it arrives nobody can confirm that the eight paintings in the shop are the
print collection he has in mind, or that the five cards are the card collection.

**A3 and A6.** Handled in section 3.

No other message has arrived since. A search of the mailbox for everything from
Brian after 17 September 2026 returns exactly two: the greeting cards and this
one.

---

## 2. Per painting

Only differences are listed. Titles, years and slugs match his emails
throughout, allowing for sentence case and the removal of his hyphens and
dashes, which the house rules require.

| Painting | Brian's words | What the site said | Now | Why |
| --- | --- | --- | --- | --- |
| Bigg Market, 1975 | "looking to pick up a bargain **or two on market day**" | "looking to pick up a bargain **in the Bigg Market**" | His wording restored | The replacement was not his and said something slightly different. Nothing was gained by it. |
| Four Doors at School Street, 1977 | Two paragraphs. The second: "The open door appears to invite the viewer in leaving the viewer with a sense of curiosity." | First paragraph only | Both paragraphs, with a comma added after "in" | A whole paragraph of his description was missing. The comma is punctuation he left out, nothing more. |
| Bensham Road, 1970 | Print email, 8 June: "Oil on paper". Card caption, 17 September: "Watercolour" | "Watercolour and ink" | "Watercolour" | See section 4. "and ink" traced to nothing he wrote. |
| Pot Pie Bob's, 1977 | "Charlie was a regular visitor to **this cafe located near the High Level Bridge**." | "Charlie was a regular visitor to **the High Level Cafe on Wellington Street, known locally as Pot Pie Bob's**." | His sentence restored | The cafe name is lettered on the painting's fascia and the nickname is in Charlie's own inscription, so it was not fabricated from nothing, but "known locally as" was an inference and his own sentence was dropped to make room for it. |
| Pop, 1967 | Three paragraphs of description | First paragraph only | All three | Two paragraphs were missing, including the only statement of where the scene is set: "the living room of the Rogers family home during their residency at Westbourne Avenue, near Saltwell Park." |
| The Men on the Seats, 1973 | No medium field. Description says "This scene created in oil" | Medium: "Oil" | Unchanged, comment added | Derived from his description rather than stated by him. Defensible, but it should be visible in the code that it is a derivation. |
| Third Street, 1980 | "A Good Choice? This painting was chosen to be the cover of the book Pursued by Bulldozers. Need I say more ?" | Cover fact moved into the description; his line discarded | Line now held in `goodChoice` like the others | Every other painting keeps his sales line in the unrendered field. This one had been dropped outright. |
| Bigg Market, Four Doors, Bensham Road, Pot Pie Bob's, Pop | Each has an "A GOOD CHOICE ?" block | Not captured at all | Captured in `goodChoice`, still not rendered | The file claims to hold all of them. Five were missing. |

### Not changed, deliberately

- **The Joke Shop quotation.** His email ends the description with:

  > "Look at his paintings and you see scenes that you remember- that Gateshead
  > joke shop by the High Level Bridge, gone but not forgotten."

  He gives no speaker, and the line appears nowhere else in the mailbox or the
  repository. It stays off until he says who said it. An unattributed quotation
  on a memorial page is worse than no quotation.

- **The Fog on the Tyne material on Pot Pie Bob's.** Four lines of lyric, plus
  the sentence crediting the cafe as the one immortalised in the song. The
  lyric is third party copyright and already logged in `docs/BACKLOG.md`. The
  claim and the quotation stand or fall together, so both are off for now.

- **"All images are for illustrative purposes only."** Closes nine of his print
  emails. Not on the site. It is a sensible line to carry once a print is
  actually purchasable, and premature while every print is price on
  application. Worth adding with the checkout, not before.

- **The Brown Ale note on Pop.** Recorded as a code comment, not published. It
  is editorial background about Newcastle Brown Ale, not product copy.

- **"The Men on the Seats is owned by Michael"** ("Website", 6 June 2026).
  Provenance, not product copy, and it names a private individual without any
  indication he agreed to be named. Left off.

- **His prices.** He has priced the book (£25) and the cards (£10 per pack of
  five) and nothing else. Every painting stays at price on application.
  "Dimensions" is blank or "TBC" on eight of the nine.

---

## 3. A3 and A6

> "The prints will be A3 size, the cards will be A6 size." (18 September 2026)

**A6 is published.** The greeting card pack now carries `dimensions: 'A6, 105 x
148mm'`. The cards are a finished printed product, nothing he has sent
contradicts the size, and A6 is an ISO 216 definition rather than a
measurement anyone has to take.

**A3 is recorded but not published.** It is held in a new `statedPrintSize`
field on every print in `lib/shop/catalogue.ts` and rendered nowhere. Two things
contradict it, and Tom needs to put both to Brian before a print size appears on
a commerce page.

**First, the files.** A3 is 42cm on the long edge, which needs 4961 pixels at
300dpi. Measured in `artwork-masters/README.md`:

| Painting | Long edge at 300dpi | A3 capable |
| --- | --- | --- |
| Town Moor, 1966 | 61cm | Yes |
| Bigg Market, 1975 | 30cm | No |
| The Joke Shop, 1966 | 17cm | No |
| Pot Pie Bob's, 1977 | 16cm | No |
| Four Doors, 1977 | 16cm | No |
| The Men on the Seats, 1973 | 16cm | No |
| Bensham Road, 1970 | 16cm | No |
| Third Street, 1980 | 5cm | No |
| Pop, 1967 | no file at all | Unknown |

One of the nine. This is not a reason to argue with the specification; it is a
reason to say plainly that seven of the eight held files cannot be printed at
the size he has chosen, and that the originals have to come from him or from
Charlie Rogers Junior. `CLAUDE.md` already says print commerce waits on those
scans, and this measurement is the arithmetic behind it.

**Second, his own earlier email.** Pot Pie Bob's, 9 June 2026:

> Dimensions
> Original painting - 22 x 21cm
> Mounted print- 30 x 25cm

A 30 x 25cm mounted print is not A3. Both figures are now in the catalogue,
neither has been reconciled, and the product page still shows the June
measurements because they are the specific ones. He may mean A3 as the new
standard across the collection and have forgotten the earlier note, or he may
mean A3 for everything except this one. It is his call.

---

## 4. Bensham Road, 1970: what the site should say, and why

Three sources, two of them his.

1. **Print email, 8 June 2026**, under the title and year: "Oil on paper".
2. **Greeting card caption**, in the "Charlie Rogers Christmas Card Selection"
   PDF attached on 17 September 2026: "Bensham Road, Gateshead 1970,
   Watercolour". This is his own published caption for the same painting, on a
   product he has had printed.
3. **The artwork.** `artwork-masters/README.md` records it as plainly
   watercolour, with ink drawing.

The site now says **watercolour**, on three grounds: it is the later of his two
statements, it is the one he has committed to print, and it is the one the
painting agrees with. What it no longer says is "watercolour and ink". That
phrase was nobody's but ours. The ink is visible in the painting, but Brian has
never described the medium that way, and a memorial catalogue should not carry
a medium that traces to an observation rather than a source.

He has stated two different media for one painting. That still wants confirming
with him, and it is already logged in `docs/BACKLOG.md`.

---

## 5. The greeting cards

Checked against "Greeting Card Collection", 17 September 2026, and the caption
text of the attached PDF as catalogued in `manifest.json`.

| Item | Brian | Site |
| --- | --- | --- |
| Price | "£10 for pack of 5" | £10, `price_pence: 1000` |
| Contents | Five designs, named in the PDF | All five named in the description, in his order |
| Rights line | "All Charlie Rogers paintings and sketches © Charles Rogers Junior" | Present, last line of the product description, so it renders on the product page |
| Size | "the cards will be A6 size" | Added: "A6, 105 x 148mm" |
| Envelopes, pack make-up | Not stated anywhere | Not claimed |

Two things unresolved, both already in `docs/BACKLOG.md` and neither safe to
decide here:

- The subject line says "Greeting Card Collection"; the PDF is titled "Charlie
  Rogers Christmas Card Selection". The site calls them greeting cards and says
  nothing about Christmas. Seasonal or year round is a commercial decision.
- "Cotfield Street, Bensham, Gateshead-on-Tyne" is captioned "????" for its
  year, so the site gives it no year. Correct, and it needs a date from him.

The PDF's per card media (watercolour for four, oil for St Cuthbert's Church)
are not listed on the product page. That is a choice about density rather than
accuracy, and could go either way.

The card designs themselves have never been seen. The PDF is still in the
mailbox and has not been downloaded, so the product has no imagery at all. See
`STILL-NEEDED.md`, tier 1 item 4.

---

## 6. The special edition book

"Pursued by Bulldozers", 16 September 2026. Everything he stated is now on the
product.

| Brian | Site |
| --- | --- |
| "a limited edition of just 100 copies" | `edition: 'Limited to 100 copies'`, and the sentence in the description |
| "PRICE £25" | £25, `price_pence: 2500` |
| "embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin" | Verbatim in the description |
| "It is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed." | Verbatim |
| "SPECIAL EDITION - EXCLUSIVE TO THIS WEBSITE" | **Was missing.** Now the sentence "This special edition is exclusive to this website." Set as a sentence, per the house rules on case and dashes |
| The book's own description, "Pursued by Bulldozers is the story of a self-taught artist..." | **Was missing.** Now the opening paragraph of the product description |

Note that his book description is not on `/book` either, which carries a
longer, site-written account instead. `lib/content/book.ts` is outside the scope
of this pass. Tom may want his official blurb to be the one that appears there
too, rather than only in the shop.

Still missing for this product: any photograph of the physical object. He sent
one, `IMG_4874.jpeg`, showing the embossed roundel and the signature. It is
still in the mailbox. This is the only revenue surface that works today and it
has no picture of what the buyer receives.

---

## 7. Things he asked for that are not on the site

Read across all 40 messages for requests, not only the product ones.

**Actioned already, confirmed during this pass**

- **Print specifications.** "This is his description. Please include this on
  the new website." (11 June 2026). Present in
  `components/shop/PrintSpecifications.tsx`, on the shop listing and on every
  print page, credited to Paul Wright at the Biscuit.
- **Talks.** "Charlie Rogers Talks personally presented by Brian Rankin. Ask
  for details." (12 June 2026). Present on `/exhibitions`.
- **Exhibitions and the QR codes.** Saltwell Towers and the Gateshead Central
  Library summer exhibition are both on `/exhibitions`, with the QR code
  addition noted.
- **The book for sale.** £25, Littlecroft Publishing, both present.

**Not actioned**

- **The Saltwell Park video.** "It would be nice to include this on the
  website" (12 June 2026). The file was a 60MB Mail Drop link that expired on
  12 July 2026 and no copy of any size survives. He has to resend it. Already
  in `docs/BACKLOG.md`.
- **The whole prints introduction.** "Prints for sale on Website", 6 June 2026,
  proposes copy for the section, opening "Explore our collection of Charlie
  Rogers fine art prints", plus a "Standard introduction for each print"
  beginning "Discover the 'Unknown Collection' of Charlie Rogers." None of it
  is used; `/shop` carries site-written copy instead. Two snags with using it
  as sent: it promises "the bustling streets of Paris", and no Paris painting
  is in the collection he then sent; and his standard introduction is cut off
  mid sentence in the email, ending "during the second half of the twentieth".
  It needs finishing by him before it can be used. `app/(public)/shop/` was out
  of scope for this pass regardless.
- **Two purchase options per print.** "A similar contemporary black frame or
  alternatively a single print delivered in a tube", with "single picture and
  living room scenes to give buyers an idea of how the new painting would look
  in their home" (6 June 2026). No framing option, no room mock-ups, and the
  data model has no notion of product variants. This is a real piece of scope
  that has not been costed.
- **Glazed items from his gallery only.** "I am wondering if glazed items
  should only be made available from my gallery ? Otherwise I think we would
  get many returns." Phrased as a question and never settled. It bears on
  fulfilment and on what the site is allowed to sell.
- **"We will need to set up a secure payment system."** (6 June 2026). There is
  no checkout. Every product is an email enquiry, and `docs/SHOP.md` records
  Stripe as not yet built.
- **The Mark Ferguson MP clip.** Sent as a Facebook link on 12 June 2026 with
  no instruction attached. Not on the site. Probably belongs in a press
  section, and embedding a Facebook video is a decision rather than a task.

---

## 8. Things on the site that Brian never said

The purpose of this pass. Two were found in the shop, both now removed.

1. **"the High Level Cafe on Wellington Street, known locally as Pot Pie
   Bob's."** He wrote "this cafe located near the High Level Bridge". The cafe
   name is readable on the painting's fascia and the nickname is Charlie's own
   inscription, so the sentence was not conjured from nothing, but "known
   locally as" asserted something no source states, and it displaced his own
   sentence. Replaced with his.
2. **"Watercolour and ink"** as the medium of Bensham Road. Neither of his two
   statements says it. Now "Watercolour". See section 4.

Nothing else in the shop copy failed to trace to a quoted line. The alt text on
each image describes what is visibly in the painting, which is the job of alt
text and not a claim about the work.

---

## 9. Could not verify

- **Whether the eight paintings in the shop are the print collection he
  means.** The 18 September message that was supposed to confirm it arrived
  without its attachment.
- **The greeting card designs.** The captions were read; the reproductions
  themselves have never been rendered or downloaded.
- **Pop, 1967.** No file has been seen. The whole product, including the
  medium, rests on Brian's email and on the file Tom holds locally.
- **Whether A3 supersedes the 30 x 25cm mounted print he gave for Pot Pie
  Bob's.** Both are his, eight days apart in the opposite order to their
  specificity.
- **The Joke Shop quotation's speaker.**
- **Third Street's true resolution.** The only copy in the mailbox is a 640 by
  449 inline image. The full resolution set was in a Mail Drop that expired on
  7 July 2026.

---

## What changed in the code

`lib/shop/catalogue.ts`

- Bigg Market description restored to his wording.
- Four Doors at School Street: missing second paragraph added.
- Pop: missing second and third paragraphs added.
- Pot Pie Bob's: invented sentence replaced with his.
- Bensham Road: medium changed from "Watercolour and ink" to "Watercolour".
- Special edition book: his book description and the exclusivity statement
  added.
- Greeting cards: `dimensions` set to "A6, 105 x 148mm".
- Five missing `goodChoice` lines captured, plus Third Street's, still not
  rendered.
- New `statedPrintSize` field holding "A3" on every print, not rendered.
- Header comment rewritten to cover all three departures from what he sent.

`supabase/seed-shop.sql` mirrors every copy, medium and dimension change above.
It does not carry `goodChoice`, `printLongEdgeCm` or `statedPrintSize`, because
there are no columns for them and nothing renders them. The file inserts with
`ON CONFLICT (slug) DO NOTHING` and was already applied to the live instance on
18 September 2026, so **re-running it will not push these corrections into rows
that already exist there**. They have to be made in the admin, or with a
deliberate UPDATE. It was left as an insert rather than turned into an upsert,
because an upsert would silently overwrite anything edited through the CMS
since, which is the worse failure on a shared database.

Nothing else was touched. Brian's exclamation marks and his pushier register
stay out of user-facing copy, per `CLAUDE.md`, and stay recorded in
`goodChoice` so they are his to reinstate rather than ours to delete.
