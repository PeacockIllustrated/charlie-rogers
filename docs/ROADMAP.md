# Roadmap

Phased build. Each phase has a clear shipping milestone. Do not skip ahead, and do not bundle phase 1 features into phase 0.

## Phase 0: Foundation (target: end of week 1)

Goal: the design system is visible and the database is ready, but no user-facing features yet.

- Next.js 15 App Router project scaffolded with TypeScript strict mode
- Tailwind configured with the tokens from `DESIGN.md`
- EB Garamond and Inter wired in via `next/font/google`
- Supabase project provisioned, local dev environment running against it
- All migrations from `SCHEMA.md` applied
- A single `/styleguide` route that renders every component variant and typographic scale, used internally as a design review surface (excluded from production sitemap)
- Sentry connected
- Project deployed to Vercel preview

Stop here. Confirm design system before moving on.

## Phase 1: Image extraction and content surfaces (week 2 to 3)

Goal: the website displays Charlie's work, organised by location.

- Image extraction pipeline run against the supplied PDF (`IMAGE-EXTRACTION.md`)
- Manifest reviewed, paintings verified against book pages, metadata captured in `seed-paintings.sql`
- 8 starter locations from page 26 of the book seeded into `locations`
- Painting cards rendering on a gallery index page (`/paintings`)
- Individual painting pages (`/paintings/[slug]`) with metadata, location, status, story
- Location index page (`/places`) listing all geographic anchors
- Individual location pages (`/places/[slug]`) showing paintings of that location, modern photo where available, demolished status flagged

By end of Phase 1, a visitor can browse Charlie's work, learn what each painting depicts, and see which locations are gone.

## Phase 2: Biography and editorial (week 4)

Goal: the site tells Charlie's story, not just shows his work.

- Biography page (`/about`) drawing from PROJECT.md
- Timeline view (`/timeline`) of life events from `timeline_events`
- People pages (`/people/[slug]`) for the major figures (Ann, Pop, Norman Cornish, Aunt Violet, Brian Rankin, Charlie Junior, Dennis Donnelly, Trevor Ermel)
- Exhibition history page (`/exhibitions`) drawing from `exhibitions`
- Editorial home page replacing the default with a curated landing built from these surfaces

The home page should lead with the bulldozers thesis. The origin story (1964, the knee injury, Aunt Violet's window) deserves prominent placement.

## Phase 3: Commerce (week 5 to 6)

Goal: the book is for sale.

- Product page for the book (`/shop/book`) with full description and the foreword extract
- Stripe Checkout integration for one-off book purchase
- Order confirmation page and Resend transactional email
- Admin order list at `/admin/orders` (protected by Supabase Auth, admin role flag)
- Order fulfilment workflow: mark as packed, generate shipping label (manual paste-in for Phase 3, Royal Mail integration is a later concern)
- Shop index (`/shop`) showing the book plus placeholder cards for "Prints, coming soon"

Do not enable print purchase. The PDF images are not print quality. Print listing pages can exist as "register your interest" surfaces if needed, but no checkout.

## Phase 4: The map (week 7 to 8)

Goal: the bulldozers thesis becomes interactive.

- Mapbox GL JS set up with a custom style matching the site palette (paper background, slate water, ochre roads, Bensham red markers)
- Comparison slider using the `mapbox-gl-compare` plugin
- Modern Mapbox base on one side, National Library of Scotland 1950s OS raster tiles on the other
- All `locations` rendered as markers with status colour coding
- Marker click opens a side panel with the painting, the modern photo where available, and the location's editorial copy
- Filter controls: show only demolished, show only extant, show by district

Full spec in `FUTURE-FEATURES.md`. This is the headline feature, treat it as a milestone in itself.

## Phase 5: Print sales, contingent on high-res scans (no fixed week)

Goal: prints can be sold.

This phase cannot start until Brian Rankin or Charlie Junior supplies high-resolution scans of the paintings to be sold. Build cannot proceed against the low-res PDF imagery.

When scans arrive:

- Storage bucket on Supabase Storage for high-res masters (private, signed URLs only)
- Image processing pipeline producing print-ready exports per painting per size
- `product_variants` populated for A4, A3, A2, optional framed variants
- Print product pages (`/shop/prints/[slug]`)
- Print product index with filtering
- Royal Mail or partner print-on-demand fulfilment integration

## Phase 6: Search, performance, SEO (week 9 onwards)

Goal: the site is discoverable and fast.

- Full-text search across paintings, locations, people, exhibitions (Postgres `tsvector` or Supabase's pgvector for semantic search if budget allows)
- Tag-based filtering and themed collections (snow scenes, Pop, Paris, demolitions)
- OpenGraph cards per painting and location
- Sitemap, structured data for paintings
- Image performance pass (Next.js Image component, AVIF where supported, proper sizes)
- Accessibility audit
- Lighthouse passes

## Phase 7: Saltwell Park trail (later, partner-dependent)

Goal: deliver the digital version of Brian Rankin's stated trail ambition.

- A trail mode accessible from the map, sequencing the Saltwell Park locations in walking order
- Mobile-first interface, GPS-aware where permitted
- Printable trail guide PDF generated from the trail data
- Coordination with Gateshead Council if the physical trail proceeds in parallel

This phase depends on conversations between Brian Rankin and Gateshead Council, and is not committed to a date.

## What is deliberately not on the roadmap

- The 3D book widget (considered, deferred, see `FUTURE-FEATURES.md`)
- 3D rendering of demolished buildings (considered, deferred, infeasible at content scale)
- Social features, comments, user accounts beyond order tracking
- Newsletter signup at scale (a single mailing list integration is fine, but not a full marketing automation stack)
- Mobile app

If any of these come up later, log them in `BACKLOG.md` and revisit when there's a clear reason to prioritise them.
