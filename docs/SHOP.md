# Shop and admin CMS

A test commerce surface for the Charlie Rogers site, modelled on the
durham-stickmakers product CMS. Products (books, prints, originals) are managed
through an admin dashboard backed by Supabase, and shown on a public `/shop`.
The book, the greeting cards and the prints can be put in a basket and
ordered; originals are by enquiry. Payment is a plug-in point: orders are taken
without online payment until Stripe is added. See "Checkout and payment".

`/shop` is linked from the site header and footer (added 12 October 2026 at
Tom's request). Since 13 November 2026 the shop and its product pages are
open to search engines, in the sitemap, and carry Product structured data;
the basket, checkout and order pages stay `noindex` and disallowed.

## Architecture

- **Public**: `app/(public)/shop/page.tsx` (listing) and
  `app/(public)/shop/[slug]/page.tsx` (detail). They inherit the normal site
  header and footer from the `(public)` route group.
- **Admin**: `app/admin/login` (Supabase email/password) and
  `app/admin/(app)/*` (dashboard, products list, new, edit), gated by
  `middleware.ts`. The admin has its own chrome (sidebar), not the public header.
- **API**: `app/api/admin/products` (POST), `app/api/admin/products/[id]`
  (PUT/DELETE, soft-delete to `archived`), `app/api/admin/upload` (image to
  Supabase Storage), `app/api/admin/signout`.
- **Data**: `lib/shop/types.ts`, `lib/shop/utils.ts`, `lib/supabase/*`.

The whole stack degrades gracefully when Supabase is not configured: `/shop`
shows an "opening soon" panel, `/admin` routes redirect to a login page that
explains setup, and admin API routes return 503.

## Setup

1. Set the Supabase env in `.env.local` (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Apply the migrations in `supabase/migrations/` (the `charlie-shop-*` files):
   tables `charlie_products` and `charlie_product_images`, RLS, and the
   `charlie-shop-images` storage bucket. All tables use the `charlie_` prefix,
   per the shared-database rule in `CLAUDE.md`.
3. Create an admin user in the Supabase dashboard (Authentication, Add user).
   Accounts are invitation-only; there is no public sign-up.
4. **Add that user to `charlie_admins`**, with the SQL under "Adding the first
   admin" below. Signing in is not enough: the roster is what grants access,
   and it starts empty. Skip this and the admin area shows "not authorised".
5. Sign in at `/admin/login`, then add products at `/admin/products/new`.
   Save as draft or publish; published products appear at `/shop`.

## Security model

- Public (anon) RLS allows reading only `published` and `sold` products and
  their images.
- **All writes require membership of `charlie_admins`, not merely a session.**
  This is a shared project database, so a signed-in user of any other project
  on the same instance would otherwise have been able to write to
  `charlie_products`. Every write policy tests `charlie_is_admin()`, a
  `SECURITY DEFINER` function that reads the roster without tripping row level
  security on itself. The same test guards the storage bucket.
- The roster has no insert, update or delete policy, so it can only be changed
  by the service role or through the Supabase dashboard. There is no path for a
  user to grant themselves access.
- Admin API routes call `requireAdmin()` before any mutation, which now returns
  403 for a valid session that is not on the roster. The admin UI shows a "not
  authorised" panel in the same case. Both are conveniences: the row level
  security policy is the real boundary and applies regardless.
- The service-role key is used only server-side, for image upload and cleanup,
  after `requireAdmin()` has passed.

### Adding the first admin

Applying `20260918090000_charlie-shop-admin-authz.sql` leaves the roster empty,
so nobody can administer the shop until one is added. Run this once in the
Supabase SQL editor, which runs as the service role:

```sql
INSERT INTO charlie_admins (user_id, email, note)
SELECT id, email, 'first admin'
FROM auth.users
WHERE email = 'you@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

### Forgotten passwords

The sign in page links to `/admin/forgot-password`, which emails a one-time
link through Supabase Auth. The link lands on `/api/admin/auth/callback`, which
signs the admin in and sends them to `/admin/reset-password` to choose a new
password. For the link to be accepted, add the live site's callback to the
Supabase project under Authentication, URL Configuration, Redirect URLs:

```
https://<the live domain>/api/admin/auth/callback
```

Supabase's built-in mailer is rate limited to a few emails an hour. That is
enough for a handful of admins; set up custom SMTP in Supabase if it is not.

## Checkout and payment

### What can be bought

Published, priced products of type `book`, `other` (the cards) or `print`
with stock left (`purchasability()` in `lib/shop/commerce.ts`). Originals are
always by enquiry.

Prints have been saleable since 13 November 2026. CLAUDE.md held them back
because the files on the site are around 108ppi, but Brian Rankin confirmed
on 12 October 2026 that Paul Wright prints from his own scans of the
originals, so our files are never what is printed.

A print is bought as one of its editions, rows in `charlie_product_options`:
a standard print (£45, made to order, stock left blank) and a limited edition
of 50 (£120, counted down). Each edition is priced and counted on its own;
the print's own price is only the "From" figure. Editions are edited in the
admin under Editions on each print, and a print added in the admin gets them
with one button. Prints are delivered free, so an order of prints alone has
no postage; anything else in the order brings the UK postage from Settings.

`charlie_place_order` applies the same rules in the database (migration
20261113090000), so the two must change together.

### Taking orders before Stripe

With the checkout set to "Open, payment by arrangement", a customer fills a
basket and places an order with no card payment. The order reserves its
stock, the shop gets an email with the order and the customer's details
(reply to it to reach them), and the customer gets a receipt saying nothing
has been taken and that the shop will be in touch to arrange payment. Mark
the order paid in the admin once the money arrives. Both emails need
email (Make or Resend, see "Setting up email") and the "Send new orders to" address.

### The flow

1. **Product page.** "Add to basket" with a quantity, shown only when the
   checkout is open. Otherwise the book and cards fall back to enquiry.
2. **Basket** (`/shop/basket`). Stored in the browser's localStorage as slugs
   and quantities only. Every view is priced by the server
   (`quoteBasketAction`), so a stale basket can never carry an old price.
   Anything no longer saleable is removed with a sentence saying why. The
   header shows a basket link only while something is in it.
3. **Checkout** (`/shop/checkout`). Name, email, optional phone, UK address,
   optional note. Validated in `lib/shop/checkout-input.ts` (tested).
4. **Placing the order** (`placeOrderAction`). Re-prices, then calls the
   `charlie_place_order` database function through the service role. That
   function locks the product rows, re-reads prices, checks stock, refuses the
   order if the subtotal differs from what the customer saw, writes the order
   and its lines, and takes the stock, all in one transaction.
5. **Payment.** The saved order is handed to a `PaymentProvider`
   (`lib/shop/payments.ts`), which returns where to send the customer.
6. **Confirmation** (`/shop/order/CR-2026-0001?t=<token>`). Read through the
   service role by order number and a 64 character access token. Empties the
   basket.
7. **Admin** (`/admin/orders`). Every order, with buttons to mark it paid,
   posted, completed, refunded or cancelled. Cancelling returns the stock
   (database trigger); a cancelled order cannot be reopened.

### Switching it on

From **/admin/settings**, which saves to the single-row `charlie_shop_settings`
table and takes effect at once:

- **Checkout.** `Closed` (the default) takes no orders. `Open, payment by
  arrangement` takes and reserves orders with no online payment: the shop
  emails the customer to arrange payment and postage, then marks the order
  paid in the admin.
- **UK postage per order.** Blank means to be confirmed, and totals read
  "before postage". Brian has not stated a figure.
- **Send new orders to.** The address emailed for each new order.

The page also shows, as yes or no, the two things only the hosting
environment can set: `SUPABASE_SERVICE_ROLE_KEY` (needed to save any order)
and the email values in "Setting up email" (needed to send the order email).
Secrets never go in the settings table.

Before the migration is applied, or on a preview without the service key,
`SHOP_CHECKOUT` and `SHOP_ORDER_NOTIFY_EMAIL` in the environment are read
instead. Once the table exists, it wins.

### Adding Stripe

Nothing outside these files needs to change:

1. `pnpm add stripe`, and set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. Add a `stripe` provider in `lib/shop/payments.ts` whose `startPayment`
   creates a Checkout Session for the order (line items from
   `charlie_order_items`, `client_reference_id` set to the order id,
   `success_url` set to `confirmationPath(order)`), stores the session id in
   `payment_reference`, and returns the session URL. Return `'stripe'` from
   `getCheckoutMode()` when the stored mode is `stripe`, and add the option to
   the Settings page.
3. Add `app/api/stripe/webhook/route.ts`. On `checkout.session.completed`, set
   the order `paid` and `paid_at` (service role). On
   `checkout.session.expired`, set it `cancelled`, which returns the stock.
4. The checkout copy for Stripe is already in
   `app/(public)/shop/checkout/page.tsx`; check the wording.

### Still to decide

- **UK postage.** Not stated by Brian. Set it at /admin/settings once agreed;
  Stripe will need a figure.
- **Card pack stock.** No print run stated; set to 100 as a placeholder.
- **Customer receipt email.** Only the shop is emailed today.

## Enquiries

Anything that cannot go in the basket (the paintings always; the book and the
cards while the checkout is closed) shows an enquiry form on its product page.
The painting pages in the catalogue link straight to it (`#enquire`).

- The form posts to `sendEnquiryAction` (`app/(public)/shop/enquire.ts`), which
  validates with `lib/shop/enquiry-input.ts` (tested), looks the product up
  again by slug, and saves the enquiry to `charlie_enquiries` through the
  service role. A hidden honeypot field and a limit of five enquiries per
  email address an hour keep scripts out.
- The admins are emailed at the "Send new orders and enquiries to" address in
  Settings, with reply-to set to the customer, once email is set up. Optional: every enquiry is listed regardless.
- `/admin/enquiries` lists them, new first, with buttons to mark replied,
  close and reopen. The dashboard shows how many are waiting.
- The table needs `20261012090000_charlie-shop-enquiries.sql`. It has no
  public policy; only admins on the roster can read or update it.
- Without `SUPABASE_SERVICE_ROLE_KEY` enquiries cannot be saved, so the page
  falls back to a mailto to `NEXT_PUBLIC_ENQUIRY_EMAIL`, or says enquiries are
  not open if that is unset too.

## Setting up email

Until email is set up, orders and enquiries are saved and listed in the admin,
but nobody is emailed, and each skipped email is logged as a warning. The
dashboard's "Ready for orders" list and Settings both say so.

The site can send through either of two services. Make is used when both of
its values are set; otherwise Resend.

### Make (the "client sites · send email" scenario)

OneDesign's Make account has one scenario that sends email for client sites.
It starts with a webhook, then a router with one route per client. Each route
checks the client name and a key, answers the site, and sends through a
connected mailbox with that client's from address.

The site posts this JSON to the webhook:

```json
{ "client": "charlie", "key": "...", "to": "...", "subject": "...", "html": "...", "replyTo": "..." }
```

1. In Make, open "client sites · send email" and add a route for Charlie, a
   copy of an existing one with the filter `client` = `charlie` and `key` = a
   long random string. Set the from address on its Send an email module to an
   address the connected mailbox is allowed to send as.
2. Turn the scenario on.
3. In Vercel, under the project's Settings, Environment Variables, add for
   Production: `MAKE_EMAIL_WEBHOOK_URL` (the scenario's webhook address) and
   `MAKE_EMAIL_KEY` (the same random string). Redeploy.
4. In Admin > Settings, save the "Send new orders and enquiries to" address,
   then press "Send a test email".

### Resend

1. Create a Resend account and add the domain `charlierogers.art`. Resend
   lists a few DNS records (SPF, DKIM); add them where the domain's DNS is
   managed and wait for Resend to show the domain as verified.
2. Create an API key in Resend.
3. In Vercel, add for Production: `RESEND_API_KEY` (the key) and
   `SHOP_EMAIL_FROM`, for example `Charlie Rogers <shop@charlierogers.art>`.
   Redeploy.
4. In Admin > Settings, save the notification address and press "Send a test
   email".

## Admin dashboard

The dashboard opens with "Ready for orders", a checklist of what has to be
true before an order reaches anyone, which folds to one line once it is all
done. Below it: orders waiting for payment or posting, new enquiries, what
has sold by product and edition, and stock running low. Orders and Enquiries
have ready-written emails (asking for payment, saying it has been posted,
replying to an enquiry) that open in the admin's own mail program.
