# Shop and admin CMS

A test commerce surface for the Charlie Rogers site, modelled on the
durham-stickmakers product CMS. Products (books, prints, originals) are managed
through an admin dashboard backed by Supabase, and shown on a public `/shop`.
There is no Stripe checkout yet; the public product page shows an "enquire"
call to action.

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
4. Sign in at `/admin/login`, then add products at `/admin/products/new`.
   Save as draft or publish; published products appear at `/shop`.

## Security model

- Public (anon) RLS allows reading only `published` and `sold` products and
  their images. All writes require an authenticated session.
- Admin API routes call `requireAdmin()` before any mutation, and the
  service-role key is used only server-side for image upload and cleanup.

## Not yet built

- Stripe checkout, orders, and a webhook (the durham version has these; this is
  CMS plus shop only for now).
- A link from the public navigation (intentionally omitted while it is a test).
