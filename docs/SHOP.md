# Shop and admin CMS

A test commerce surface for the Charlie Rogers site, modelled on the
durham-stickmakers product CMS. Products (books, prints, originals) are managed
through an admin dashboard backed by Supabase, and shown on a public `/shop`.
The book and the greeting card pack can be put in a basket and ordered;
everything else is by enquiry. Payment is a plug-in point: orders are taken
without online payment until Stripe is added. See "Checkout and payment".

`/shop` is deliberately not linked from the site header or footer. It is a test
surface, reachable only by visiting the URL directly. It is also set to
`noindex`.

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

## Checkout and payment

### What can be bought

Only published, priced products of type `book` or `other` with stock left
(`purchasability()` in `lib/shop/commerce.ts`). Prints and originals are always
by enquiry: the files we hold are not print quality, and CLAUDE.md rules out a
print purchase flow against them. `charlie_place_order` applies the same rule
in the database, so the two must be widened together when scans arrive.

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

`SHOP_CHECKOUT` chooses the mode. Unset or `closed` is the default and takes
no orders. `manual` takes and reserves orders with no online payment: the shop
emails the customer to arrange payment and postage, then marks the order paid
in the admin. Either way the checkout also needs `SUPABASE_SERVICE_ROLE_KEY`,
and the `20261006150000_charlie-shop-orders.sql` migration applied.

Optional: set `RESEND_API_KEY`, `SHOP_EMAIL_FROM` and `SHOP_ORDER_NOTIFY_EMAIL`
and the shop is emailed each new manual order. Without them, orders only
appear in the admin.

### Adding Stripe

Nothing outside these files needs to change:

1. `pnpm add stripe`, and set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. Add a `stripe` provider in `lib/shop/payments.ts` whose `startPayment`
   creates a Checkout Session for the order (line items from
   `charlie_order_items`, `client_reference_id` set to the order id,
   `success_url` set to `confirmationPath(order)`), stores the session id in
   `payment_reference`, and returns the session URL. Return `'stripe'` from
   `getCheckoutMode()` when `SHOP_CHECKOUT=stripe`.
3. Add `app/api/stripe/webhook/route.ts`. On `checkout.session.completed`, set
   the order `paid` and `paid_at` (service role). On
   `checkout.session.expired`, set it `cancelled`, which returns the stock.
4. The checkout copy for Stripe is already in
   `app/(public)/shop/checkout/page.tsx`; check the wording.

### Still to decide

- **UK postage.** Not stated by Brian. `UK_POSTAGE_PENCE` in
  `lib/shop/commerce.ts` is null, so totals read "before postage". Stripe
  needs a figure.
- **Card pack stock.** No print run stated; set to 100 as a placeholder.
- **Customer receipt email.** Only the shop is emailed today.

## Not yet built

- A link from the public navigation (intentionally omitted while it is a test).
