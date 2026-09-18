# Shop code audit

Read-only audit of the shop and admin surface, 18 September 2026. No code was changed.

Checks actually run: `npx tsc --noEmit` (node_modules was present, it completed, exit 0, no
type errors); ripgrep passes over `app`, `components`, `lib`, `supabase` and `middleware.ts`
for em-dashes, en-dashes, emoji, exclamation marks, `rounded-*`, `shadow-*`, `any`, American
spellings and non-ASCII characters; full manual read of every file listed in the brief plus
the public pages and shared components used for comparison. Nothing here is inferred from a
check that was not run.

Findings are ordered by severity. Confirmed defects come first; matters of taste are in their
own section at the end and are not padded with the same items.

---

## 1. Security

### 1.1 `requireAdmin()` authenticates but does not authorise (critical)

`lib/admin-auth.ts:17-27`

```ts
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) { return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } }
return { user, error: null }
```

The function is named `requireAdmin` and `SHOP.md:45-50` describes it as the admin gate, but it
only proves that somebody is signed in. `CLAUDE.md` is explicit that the Supabase instance is a
**shared project database**. Every authenticated user of that shared project, including users
created by unrelated projects, passes this check and can create, edit, archive and upload against
`charlie_products`. `SHOP.md:40-41` says accounts are invitation-only, but that is a setting in
someone else's Supabase dashboard, not something this code enforces.

Fix: check an explicit claim, for example `user.app_metadata.roles?.includes('charlie_admin')`
or an allowlist table `charlie_admin_users` keyed on `user.id`, and return 403 when it is absent.
Rename the return to make the failure mode obvious.

### 1.2 RLS grants full write to any authenticated role (critical)

`supabase/migrations/20260601120001_charlie-shop-rls.sql:31-39`

```sql
CREATE POLICY charlie_products_insert_admin ON charlie_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY charlie_products_update_admin ON charlie_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY charlie_products_delete_admin ON charlie_products FOR DELETE USING (auth.role() = 'authenticated');
```

and the same shape at `supabase/migrations/20260601120002_charlie-shop-storage.sql:19-26` for
the storage bucket. This is the database-level twin of 1.1, and it means the application-level
gate is the only gate. A stolen or borrowed session from any project on the shared instance has
write access to this project's shop tables and image bucket.

Fix: replace `auth.role() = 'authenticated'` with a membership test, for example
`EXISTS (SELECT 1 FROM charlie_admin_users WHERE user_id = auth.uid())`, and add `TO authenticated`
to the policies so they are not evaluated for anon at all.

### 1.3 Anonymous read restriction on products is correct

`supabase/migrations/20260601120001_charlie-shop-rls.sql:15-25`

The public select policy is `USING (status IN ('published', 'sold'))`, and the images policy
gates on an `EXISTS` against the same statuses. Both tables have RLS enabled at lines 8-9. This
matches `SHOP.md:46-47`. No defect. Note only that permissive policies are OR'd, so the admin
select policy at line 31 widens reads for any authenticated user, which is the 1.2 problem again
rather than a separate one.

### 1.4 Storage bucket read is bucket-wide, so draft images are public

`supabase/migrations/20260601120002_charlie-shop-storage.sql:15-16`

```sql
CREATE POLICY charlie_shop_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'charlie-shop-images');
```

The bucket is also created `public` at line 8. Images belonging to `draft` and `archived`
products are therefore retrievable by anyone who has the URL, even though the product row itself
is hidden by RLS. For a shop where unpublished listings may be work in progress for a client,
that is a leak of unreleased material.

Fix: either make the bucket private and serve signed URLs from the server, or accept the exposure
and record the decision in `SHOP.md`.

### 1.5 `/api/admin/signout` is the route that skips `requireAdmin()` (low)

`app/api/admin/signout/route.ts:4-9`

It is the only admin route that does not call `requireAdmin()`. This is defensible, since signing
out an unauthenticated caller is a no-op, but there is also no origin or CSRF check, so any page
on the internet can POST a hidden form and log the admin out. No data mutation, so severity is low.

Fix: verify `request.headers.get('origin')` against the site origin before signing out.

### 1.6 Raw Postgres error text is returned to the browser (low)

`app/api/admin/products/route.ts:69` and `:86`,
`app/api/admin/products/[id]/route.ts:79` and `:142`,
`app/api/admin/upload/route.ts:47`

```ts
return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 })
```

Constraint names, column names and enum values reach the client. Log the detail server-side and
return a generic message.

### 1.7 Service role key: no leak found, but no guard either

Verified every importer of `lib/supabase/server.ts`: the two public shop pages, the admin layout
and pages, the login page, `lib/admin-auth.ts` and the four API routes. All are server-side.
`createSupabaseServiceClient()` is called only in `app/api/admin/upload/route.ts:39` and
`app/api/admin/products/[id]/route.ts:98`, both after `requireAdmin()`. The key is read from
`SUPABASE_SERVICE_ROLE_KEY`, without the `NEXT_PUBLIC_` prefix, so Next would not inline it into
a client bundle even if the module were imported from one. **No leak.**

Hardening, not a defect: `lib/supabase/server.ts:1` has no `import 'server-only'`, so a future
client import would fail at runtime with a confusing error rather than at build time with a clear
one. Add the guard.

### 1.8 Upload route file type and size are restricted

`app/api/admin/upload/route.ts:7-26`

`MAX_BYTES` is 10 MB and enforced at line 21, `ALLOWED` is a four-entry MIME allowlist enforced
at line 24, the extension is derived from the checked type rather than the filename (lines 28-35),
the path is randomised with `randomUUID()` (line 37), and `productId` is stripped to
`[a-zA-Z0-9-]` (line 36). The bucket repeats both limits at
`20260601120002_charlie-shop-storage.sql:9-10`. **The brief's suspicion is not borne out; this route
is fine.**

Two small residual points: `file.type` is client-supplied and not verified against magic bytes,
which the bucket's own `allowed_mime_types` mitigates; and `await request.formData()` at line 14
is unguarded, so a malformed multipart body throws an unhandled 500 instead of a 400.

---

## 2. Correctness defects

### 2.1 Sold is unreachable from the admin, and editing a sold product destroys the status

`components/admin/ProductForm.tsx:136`

```tsx
void submit(form.status === 'published' ? 'published' : 'draft')
```

with the only two explicit actions at `:288` (`submit('draft')`) and `:296` (`submit('published')`).
`ProductStatus` includes `sold` (`lib/shop/types.ts:5`), the public detail page renders a sold
treatment (`app/(public)/shop/[slug]/page.tsx:49`, `:74`, `:100-103`), the card renders a sold
sticker (`components/shop/ProductCard.tsx:27-31`) and RLS deliberately keeps sold products
readable. Nothing in the admin can ever set that status, and opening a sold product and saving it
silently rewrites it to `draft`, which removes it from the shop.

Fix: make status an explicit control in the form (draft, published, sold), and have `submit()`
pass the chosen status rather than inferring it.

### 2.2 The PUT route does not validate its body, so a bad request is a 500

`app/api/admin/products/[id]/route.ts:64`

```ts
title: body.title.trim(),
```

The POST route validates both title and price (`app/api/admin/products/route.ts:40-45`). The PUT
route validates neither. A body without `title` throws `Cannot read properties of undefined` and
returns an unhandled 500; a non-numeric or negative `price_pence` reaches the
`CHECK (price_pence >= 0)` constraint and returns a 500 with the raw constraint text.

Fix: lift the POST route's two guards into a shared validator and call it from both.

### 2.3 Supabase errors are swallowed on both public shop pages

`app/(public)/shop/page.tsx:19-25`

```ts
const { data } = await supabase.from('charlie_products').select(...)
products = (data as ShopProduct[] | null) ?? []
```

and `app/(public)/shop/[slug]/page.tsx:15-21`, same pattern with `maybeSingle()`.

`error` is destructured in neither. A Supabase outage, an RLS misconfiguration or a renamed column
all render as the cheerful "The shop is opening soon" panel (`:39-46`) or as a 404. The admin list
page gets this right at `app/admin/(app)/products/page.tsx:42` and `:76-80`; the public pages
should match. `app/admin/(app)/page.tsx:7` has the same omission.

Fix: destructure `error`, and render a distinct "listings could not be loaded" state so an outage
is not mistaken for an empty catalogue.

### 2.4 The empty state conflates three different situations

`app/(public)/shop/page.tsx:17` and `:38-46`

"The shop is opening soon" is shown when Supabase is not configured, when the query failed, and
when there genuinely are no published products. At a client review with no env configured, this is
the entire shop. See also section 5.

### 2.5 The image reconcile loop is sequential and unchecked

`app/api/admin/products/[id]/route.ts:102-121`

```ts
for (const img of body.images) {
  if (img.id) { await supabase.from('charlie_product_images').update({...}).eq('id', img.id) }
  else { await supabase.from('charlie_product_images').insert({...}) }
}
```

Six images means six sequential round trips on every save, and not one return value is checked, so
a partial failure still returns `200 { id }` and the admin sees a successful save. The delete at
`:95` and the storage removal at `:98` are equally unchecked.

Fix: one `upsert` for the rows that have ids and one bulk `insert` for the rest, both with their
errors checked and surfaced.

### 2.6 The detail page queries Supabase twice per request

`app/(public)/shop/[slug]/page.tsx:30` (inside `generateMetadata`) and `:46` (inside the page).

Both call `fetchProduct(slug)`, which issues an identical query. Next's request de-duplication does
not cover the Supabase client, so every product view costs two queries.

Fix: wrap `fetchProduct` in React's `cache()`.

### 2.7 No image carries width and height

`components/shop/ProductCard.tsx:16-21`, `components/shop/ProductImageGallery.tsx:35-39` and
`:63-67`, `app/admin/(app)/products/page.tsx:116-120`, `components/admin/ImageUploader.tsx:164`.

Every one is a bare `<img>` with an eslint suppression and no intrinsic dimensions, so the shop
grid reflows as images arrive. This matches the rest of the site, and `components/PaintingCard.tsx:5`
documents the deferral ("Next.js Image and proper sizes are deferred to the Phase 6 performance
pass"). The shop copies the behaviour without copying the justification. Not a regression, but the
shop is the surface where remote Supabase images make the reflow worst, since they are not local
files.

### 2.8 Alt text can never be set

`components/admin/ImageUploader.tsx:66` sets `alt_text: null` on upload and the component offers no
field to edit it; `components/admin/ProductForm.tsx:88` passes `img.alt_text ?? null` straight
through. The column exists (`20260601120000_charlie-shop-schema.sql:60`), the type exists
(`lib/shop/types.ts:33`) and both consumers fall back to the product title
(`ProductCard.tsx:18`, `ProductImageGallery.tsx:37`). The result is that every image of a
multi-image product has identical alt text. For a heritage site, that is a real accessibility gap.

Fix: add an alt text input under each thumbnail in `ImageUploader`.

### 2.9 Editing a product silently reassigns the primary image

`app/admin/(app)/products/[id]/edit/page.tsx:51`

```ts
is_primary: i === 0,
```

The stored `is_primary` flag is discarded and recomputed from display order. If the primary image
is not the first by `display_order`, simply opening and saving the edit page moves it.

### 2.10 `stock_count` is captured and never used

`lib/shop/types.ts:19`, `components/admin/ProductForm.tsx:249-262`,
`20260601120000_charlie-shop-schema.sql:39`. Neither shop page references it. A product with stock
zero still presents as available. Either drive the sold state from it or drop the field from the
form until it does something.

### 2.11 Unbounded queries with no pagination

`app/(public)/shop/page.tsx:20-24` and `app/admin/(app)/products/page.tsx:36-37` both
`select('*, images:...(*)')` with no `.limit()` and no paging. Fine at ten products, not at five
hundred. `app/admin/(app)/page.tsx:7-13` fetches every row purely to count four statuses in
JavaScript, where four `head: true` count queries would do.

### 2.12 Slug handling does not meet `SCHEMA.md`

`20260601120000_charlie-shop-schema.sql:88-101`

```sql
NEW.slug = lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
NEW.slug = NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 4);
```

The admin form has no slug field, so every product URL is trigger-generated and ends in a random
four-character suffix. `SCHEMA.md:283-285` asks for readable, hyphenated slugs. Accented characters
are stripped rather than transliterated, so "Giclée" becomes "gicle", and untrimmed titles produce
doubled hyphens. The slug is also never regenerated on rename, and there is no way to correct one.

Fix: add a slug field to the form with a title-derived default, keep the trigger only as a fallback,
and transliterate rather than strip.

### 2.13 Orphaned uploads

`app/api/admin/upload/route.ts:16` and `:37`. In the create flow there is no product id yet, so
files land in `products/unassigned/`. They are never moved once the product exists, and nothing
cleans them up if the admin abandons the form. The delete path at
`app/api/admin/products/[id]/route.ts:96-99` only removes images that were saved to a row.

### 2.14 Middleware does work it does not need to, and does not do work it appears to

`middleware.ts:11` matches `/shop/:path*`, so every anonymous shop page view pays a
`supabase.auth.getUser()` network round trip (`lib/supabase/middleware.ts:46-48`) for a session the
shop never reads. Separately, the matcher includes `/api/admin/:path*`, but
`lib/supabase/middleware.ts:16` computes `isAdminRoute = pathname.startsWith('/admin')`, which is
false for `/api/admin/...`, so that matcher entry only refreshes cookies and gates nothing. The API
routes are protected by `requireAdmin()` alone. Not a hole, but the config reads as though the
middleware is a second layer when it is not.

### 2.15 Things the brief asked about that are in fact correct

Stated factually so the next pass does not go looking:

- The detail page returns `notFound()` on a missing slug (`app/(public)/shop/[slug]/page.tsx:47`),
  it does not throw.
- `generateMetadata` exists on the detail page (`:24-38`) and handles the not-found case at `:31`.
- `noindex` is set on the listing (`app/(public)/shop/page.tsx:11`), the detail page (`:36`), the
  admin app layout (`app/admin/(app)/layout.tsx:7`) and the login page (`app/admin/login/page.tsx:8`),
  as `SHOP.md:9-11` requires. There is no `sitemap.ts` or `robots.ts` in the project, so nothing
  contradicts it, and `/shop` appears in neither `components/Header.tsx` nor `components/Footer.tsx`.
- `npx tsc --noEmit` exits 0.

---

## 3. House rule compliance

Exhaustive, and mostly clean. Everything below was grep-verified across `app`, `components`,
`lib`, `supabase` and `middleware.ts`.

| Rule | Result |
| --- | --- |
| Em-dashes | None. Also no en-dashes and no `&mdash;` entities. |
| Emoji | None. The only non-ASCII characters in the shop and admin files are `‹` and `›` (`components/admin/ImageUploader.tsx:180`, `:189`), `é` in "Giclée" (`ProductForm.tsx:199`, schema migration line 35) and `£` (`ProductForm.tsx:237`, `lib/shop/utils.ts:10`). All legitimate. |
| Exclamation marks in copy | None. Every `!` in the tree is a logical negation. |
| American spellings in copy | None. Every hit is a CSS or Tailwind identifier and therefore unavoidable: `items-center`, `justify-center`, `text-center`, `transition-colors`, `background-color`, `color`. The project's own identifiers use British spelling, for example `STATUS_COLOURS` at `app/admin/(app)/products/page.tsx:19`. |
| Title Case headings, buttons, labels | None found. All shop and admin strings are sentence case: "New listing", "Save as draft", "Price and stock", "Artwork details", "Fine art print", "Enquire about this". |
| `rounded-*` | None anywhere in the project. |
| `shadow-*` | None. The only matches are comments that state the rule. |
| `any` without justification | None. No `: any`, `as any`, `<any>` or `any[]` in the tree. |
| `charlie_` prefix on tables, indexes, foreign keys, policies, triggers, functions and enums | Complete. Tables `charlie_products`, `charlie_product_images`; indexes `idx_charlie_*`; enums `charlie_product_type`, `charlie_product_status`; functions `charlie_set_updated_at`, `charlie_generate_slug`; triggers `charlie_products_updated`, `charlie_products_slug`; all eight RLS policies and all four storage policies prefixed. The one unnamed constraint, the foreign key at `20260601120000_charlie-shop-schema.sql:58`, auto-names to `charlie_product_images_product_id_fkey` from the prefixed table name, so it complies too. **No violations.** |

One borderline client component: `components/admin/AdminSidebar.tsx:1` is `'use client'` solely for
`usePathname()` active-link highlighting. It could be a server component with a small client child,
or use `next/navigation` on the server via the layout's segment. Minor, admin-only. The other three,
`ProductForm`, `ImageUploader` and `ProductImageGallery`, all hold state and need it.

The one genuine copy defect:

**Agency credit in the public meta description.** `app/(public)/shop/page.tsx:9-10`

```ts
description: 'Books and fine art prints from the Charlie Rogers archive. By Onesign & Digital.',
```

No other page in the site carries a build credit, and this one is on a memorial site for a named
person. It also uses an ampersand where the rest of the copy does not. Remove it.

**Copy contradicts the brief.** `app/(public)/shop/page.tsx:10` and `:34` both advertise fine art
prints ("Books and fine art prints of Charlie Rogers' work. Each print is reproduced from the
archive..."). `CLAUDE.md`, under "What this site does not do, yet", is explicit that prints cannot
be sold because only low-resolution assets exist. The shop currently promises a product the project
has decided it cannot supply. This is the line most likely to be read aloud in a client review.

---

## 4. Design system drift

The shop is closer to the rest of the site than "bolted on" would suggest. It uses the same page
shell (`mx-auto max-w-content px-6 py-12`), the same `SectionHeading`, `Eyebrow`, `BackLink` and
`Button` components, the same two-column detail grid as `app/(public)/places/[slug]/page.tsx:50`,
and the same warm paper mount behind images. The drift is at the level of detail, and it all pushes
in the same direction: towards a shop template and away from a catalogue.

### 4.1 Badges, which `DESIGN.md` bans outright

`DESIGN.md:186` under Don'ts: "No badges, no 'NEW' labels, no countdown banners."

- `components/shop/ProductCard.tsx:27-31` puts a solid Bensham "Sold" sticker absolutely positioned
  over the corner of the painting. The site already has the sanctioned pattern for exactly this,
  `components/StatusLabel.tsx`, a small colour marker plus a word set below the image, derived from
  the book's map dots (`DESIGN.md:138-146`).
- `app/admin/(app)/products/page.tsx:19-23` and `:146-153` render status as filled chips, including
  `bg-sage/20`, a colour `DESIGN.md:146` specifically flags as failing contrast.
- `components/admin/ImageUploader.tsx:166-170` adds a "Primary" sticker.

Fix for the public one: replace the sticker with a `StatusLabel`-style marker in the caption block.

### 4.2 Bensham red used as chrome and as a price

`DESIGN.md:36`: "The Bensham red is precious. Reserve it for: section heads in the book-style
breadcrumb, primary CTAs, location markers on the map, and the brand wordmark."

- `app/(public)/shop/[slug]/page.tsx:73` sets the price in `text-h3 text-bensham`, making it the
  second loudest element on the page after the title. In a museum catalogue the price is metadata;
  here it is a headline. Moving it into the `dl` spec list at `:87-96` would fix both the colour
  rule and the tone.
- `components/admin/AdminSidebar.tsx:37`, `app/admin/(app)/products/page.tsx:67` and the error
  panels at `ProductForm.tsx:141` and `LoginForm.tsx:70` use Bensham as ordinary UI chrome.

### 4.3 Raw values instead of tokens

- `text-[10px]` at `app/admin/(app)/products/page.tsx:122`, `ImageUploader.tsx:167` and `:195`.
  The scale's floor is `xs` at 12px (`DESIGN.md:88`); 10px is below it.
- `aspect-[4/3]` at `ProductCard.tsx:23`, `aspect-[4/5]` at `ProductImageGallery.tsx:22`,
  `min-h-[10rem]` at `ProductForm.tsx:180`.
- Alpha-modified palette colours with no token behind them: `bg-paper-warm/50`
  (`shop/page.tsx:39`), `bg-bensham/5` and `border-bensham/30` (`ProductForm.tsx:141`,
  `products/page.tsx:77`, `LoginForm.tsx:70`), `bg-ink/40` (`ImageUploader.tsx:171`), `bg-paper/90`
  (`ImageUploader.tsx:177`), `bg-sage/20` (`products/page.tsx:21`). These produce off-palette
  colours the palette never sanctioned.
- `border-2` at `ProductImageGallery.tsx:53` and `ImageUploader.tsx:109`, where `DESIGN.md:100`
  asks for hairline rules.

### 4.4 Card typography diverges from the site's card

`components/shop/ProductCard.tsx:35-43` sets the title at `text-h4` and the metadata at `text-xs`.
`components/PaintingCard.tsx:29-34`, the component `DESIGN.md:115-136` calls "the primary content
surface", sets the title at `text-body-lg font-medium` and the metadata at `text-small`. Two card
types, two type scales, side by side in the same visual language. The shop card also drops the
`figure`/`figcaption` semantics the painting card uses.

### 4.5 The detail page skips components it should be using

`app/(public)/shop/[slug]/page.tsx:80-84` renders the description in a raw
`div ... whitespace-pre-wrap` where `components/Prose.tsx` exists for exactly this and is used by
every other detail page. The image at `ProductImageGallery.tsx:32-41` is a bare div where
`places/[slug]/page.tsx:53-63` uses `figure` with a `figcaption`. The shop detail page is also the
only public detail page with no `BookCallout` at the foot, which every other one has
(`places/[slug]:84`, `work/page.tsx:80`).

### 4.6 Minor spacing divergence

`app/(public)/shop/page.tsx:37` uses `mt-12` for the first block after the heading; `work/page.tsx:69`
and `places/page.tsx:71` use `mt-14`.

---

## 5. Shop readiness for a client review

Factual inventory. Several items the brief expected to be missing are in fact present.

**Present and working**

- Price formatting, correct and localised: `lib/shop/utils.ts:11-16`, `Intl.NumberFormat('en-GB', GBP)`.
- Sold state on the public side: strikethrough price and a disabled call to action
  (`[slug]/page.tsx:74`, `:100-103`), sticker on the card (`ProductCard.tsx:27-31`), and RLS keeps
  sold products visible (`rls migration:16`).
- Multi-image handling: main image plus a thumbnail rail with keyboard-reachable buttons and
  `aria-current` (`ProductImageGallery.tsx:43-73`); drag-to-reorder and delete in the admin
  (`ImageUploader.tsx:143-204`); maximum six images.
- Empty state on the listing (`shop/page.tsx:38-46`) and in the admin (`products/page.tsx:82-91`).
- `noindex` on every shop and admin surface, and `/shop` absent from the header and footer, as
  `SHOP.md:9-11` requires.
- Admin status filter (`products/page.tsx:11-17`, `:59-74`), soft delete to `archived`
  (`api/admin/products/[id]/route.ts:127-145`), draft and publish flow, graceful degradation when
  Supabase is unset.

**Absent**

- **An enquiry route of any kind.** This is the single biggest gap for a review.
  `app/(public)/shop/[slug]/page.tsx:105` sends "Enquire about this" to `/book`, and `:111` sends
  "contact the gallery" to `/book` as well. Neither is an enquiry form and neither mentions the
  product. `/book` itself only says "Price on request" and names a physical gallery
  (`app/(public)/book/page.tsx:73-76`). A client clicking the primary call to action lands on an
  unrelated page.
- The sold call to action is a link to `#` (`[slug]/page.tsx:101`), which is focusable, navigates
  nowhere and reads as an interactive control to a screen reader. It should be a static label.
- No public sort, filter, search or pagination. Order is fixed to featured, then recently updated
  (`shop/page.tsx:23-24`).
- No structured data. `Product` JSON-LD would be the norm, though it is moot while the page is
  `noindex`; worth adding at the same time the `noindex` comes off, not before.
- No stock or sold-out logic (see 2.10), and no handling for a price of zero, which renders as
  "£0.00" rather than "Price on request", despite that being the wording the book page already uses.
- No admin control over slug, `meta_title`, `meta_description`, alt text or sold status. Four of
  those columns exist in the schema and the type and are simply unreachable.
- No checkout, orders or webhook, which `SHOP.md:52-56` states as intentional.
- No tests, and no seed or demo data.

**The practical blocker.** Without Supabase env set, `/shop` renders only the "opening soon" panel
and `/admin` redirects to a setup notice. There is nothing for a client to look at. Before the
review, either point the build at a Supabase project with three or four real listings, or add a
small local fixture behind `isSupabaseConfigured()` so the page has something to show. Everything
else in this document is secondary to that.

---

## 6. Matters of taste

Separated deliberately. None of these is a defect.

1. The listing intro, `shop/page.tsx:34`, "supports the work of keeping his record of Tyneside
   alive", is softer and more promotional than the rest of the site's copy. `DESIGN.md:185` bans
   marketing vocabulary; this does not use the banned words, but it sits closer to that register
   than "Heritage site first, commerce second" suggests.
2. The overall read of the detail page is commerce-first: type, then price in red, then description,
   then spec, then a buy-shaped button. A catalogue ordering would be title, provenance and spec,
   description, and availability last. The components are all in place to do it; it is a matter of
   reordering the JSX.
3. `ProductImageGallery` chooses `sorted[activeIndex] ?? sorted[0]` (`:18`), which is defensive but
   means a stale index silently shows the wrong image rather than failing visibly.
4. The admin table header at `app/admin/(app)/products/page.tsx:97` is an empty `<th>` for the
   thumbnail column. A visually hidden label would be better.
5. `PRODUCT_TYPE_LABELS` (`lib/shop/types.ts:39-44`) includes "Other", which will end up on a public
   page as an eyebrow reading "Other" (`[slug]/page.tsx:68`). Consider removing the option.
