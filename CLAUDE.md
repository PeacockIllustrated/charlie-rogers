# Charlie Rogers website, init pack

This is the master instruction file. Read this first, then the files in `/docs` in order before writing any code.

## What this project is

A memorial and commerce website for the painter Charlie Rogers (1930 to 2020), built around the book *Charlie Rogers, Pursued by Bulldozers* (Littlecroft Publishing, 2025, compiled by Brian Rankin). The site has two jobs:

1. Archive and present Charlie's life, work, and the places he painted, with appropriate weight given to the central narrative (he raced demolition crews to paint Tyneside before it was flattened).
2. Sell the book and, in time, sell fine art prints of his paintings.

Heritage site first, commerce second. Tone is archival and respectful, not pushy. Think National Trust shop or a museum's online catalogue, not Etsy.

## Who Charlie was, in two sentences

Self-taught Gateshead painter who documented the back lanes, pubs, churches, and corner shops of Tyneside from the mid 1960s until his death in 2020, often painting buildings days or weeks before the bulldozers arrived. Around 1,000 works across 56 years, exhibited four times at the Royal Academy, positioned by Brian Rankin as the third name in a Lowry, Cornish, Rogers lineage of post-war Northern English chroniclers.

Full context in `/docs/PROJECT.md`.

## Read these files before building

In order:

1. `/docs/PROJECT.md` — Charlie's biography, the book, the cast, the geography, the legacy ambitions.
2. `/docs/DESIGN.md` — Visual system. Modern with heritage roots, theme grounded in Charlie's palette and the book's typography.
3. `/docs/SCHEMA.md` — Supabase Postgres schema with RLS notes.
4. `/docs/IMAGE-EXTRACTION.md` — How to pull paintings out of the supplied PDF. Includes the gotchas (resolution, rotation, masks).
5. `/docs/ROADMAP.md` — Phased build plan.
6. `/docs/FUTURE-FEATURES.md` — Ideas considered and deferred, including the historical map comparison slider and 3D notes.

## Tech stack, non-negotiable

- Next.js 15 (App Router) with TypeScript strict mode
- Tailwind CSS (no UI library, build components from scratch using the tokens in DESIGN.md)
- Supabase (Postgres, Auth, Storage, RLS)
- Stripe (Checkout for book and future print sales)
- Resend for transactional email
- Vercel for hosting
- Sentry for error monitoring

## House rules

Read these carefully. Tom has consistent preferences across all his projects.

**Copy and content**
- No em-dashes anywhere. Use commas, semicolons, or full stops.
- No emoji.
- No exclamation marks in user-facing copy.
- Sentence case for headings, buttons, labels.
- British spelling throughout. Colour, not color. Centre, not center.

**Visual**
- Square corners by default. No `rounded-*` classes unless there's a specific reason to soften something (and document why).
- No drop shadows.
- Generous whitespace, restrained hierarchy, type-led layouts.
- The book design (Bembo and Futura, deep wine red headers, tight grid) is the reference point.

**Code**
- TypeScript strict. No `any` unless commented with justification.
- Server Components by default, Client Components only where interactivity demands.
- Co-locate types with the code that uses them.
- Database access through Supabase server client in Server Components or route handlers, never expose the service role key to the client.

**Database**
- The Supabase instance is a shared project database. Every table this project creates must use the `charlie_` prefix, for example `charlie_paintings`, `charlie_locations`, `charlie_orders`. This namespaces our tables away from other projects that share the same database.
- The table names in `/docs/SCHEMA.md` are written without the prefix. Apply `charlie_` to all of them, and to their indexes, foreign keys, RLS policies, and triggers, when writing migrations and seed SQL.

## Project structure

```
/
├── CLAUDE.md                       ← you are here
├── README.md
├── docs/                           ← read these before writing code
├── pdf/
│   └── charlie-rogers-book.pdf    ← source material (supplied separately)
├── scripts/
│   └── extract-images.sh           ← image extraction pipeline
├── app/                            ← Next.js App Router
├── components/
├── lib/
│   └── supabase/
├── public/
│   └── paintings/                  ← extracted images land here
├── supabase/
│   └── migrations/
└── package.json
```

## Phase 1 priorities

Do not try to build everything at once. Phase 1, in this order:

1. Scaffold the Next.js project with the design tokens from DESIGN.md applied to `tailwind.config.ts` and `globals.css`.
2. Set up the Supabase project locally and apply the schema from SCHEMA.md as a migration.
3. Run the image extraction pipeline from IMAGE-EXTRACTION.md against the supplied PDF, producing the painting assets and a `seed.sql` of metadata.
4. Build the layout shell (header, footer, typography test page) so the design system can be reviewed before any feature work.
5. Build the book product page and the Stripe checkout for it, because that is the only revenue surface that does not depend on high-res scans being supplied.

Stop after each numbered step and confirm before moving on.

## What this site does not do, yet

- Sell prints. The PDF supplied is the low-resolution version. Embedded images are around 108 ppi, which is fine for web galleries but nowhere near print quality. Print commerce requires original high-resolution scans from Brian Rankin or Charlie Rogers Junior. Build the product listing structure so prints can be added later, but do not enable a print purchase flow against the low-res assets.
- The historical-modern map comparison slider. This is a planned feature, spec lives in FUTURE-FEATURES.md, but it sits in a later phase.

## Field notes protocol

If Tom says "field note" during the build, log it as a todo or backlog item in `/docs/BACKLOG.md`. Acknowledge capture, do not implement. Tom uses this to keep ideas flowing without derailing whatever is being worked on.

## Pushback expected

Tom values direct technical pushback when the evidence diverges from a stated assumption. If something in these docs turns out to be wrong, or if there is a materially better way to do something, say so before quietly doing the other thing.
