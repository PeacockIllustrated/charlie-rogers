# Database schema

Supabase Postgres. Migrations live in `/supabase/migrations`. Apply through the Supabase CLI.

All tables use UUIDs, `created_at` timestamptz, and Row Level Security enabled with explicit policies. Service role bypasses RLS for admin operations through server-side route handlers only.

## Tables

### locations

Geographic anchors. Where Charlie painted. Some still exist, some don't.

```sql
create table locations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  district text,                    -- 'Bensham', 'Saltwell', 'Newcastle Quayside', 'Paris'
  region text not null default 'gateshead',  -- 'gateshead' | 'newcastle' | 'beyond'
  lat double precision,
  lng double precision,
  status text not null default 'unknown'
    check (status in ('extant', 'demolished', 'altered', 'unknown')),
  demolished_year integer,
  modern_description text,          -- 'Now a Vistry Group housing development'
  historical_description text,      -- 'A row of Edwardian terraced houses, the netty in the back yard'
  display_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index locations_region_idx on locations(region);
create index locations_status_idx on locations(status);
```

### paintings

The core content table.

```sql
create table paintings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  year_painted integer,
  year_painted_approx boolean default false,
  medium text,                      -- 'Pen and wash', 'Oil on board', 'Watercolour'
  dimensions text,                  -- '14 x 10 inches' or '36 x 25 cm'
  location_id uuid references locations(id),
  description text,                 -- editorial caption
  story text,                       -- longer-form anecdote where one exists

  -- Charlie's recurring motifs, useful for filtering and themed collections
  has_black_dog boolean default false,
  has_lamppost boolean default false,
  has_brown_ale boolean default false,
  features_pop boolean default false,
  is_snow_scene boolean default false,
  is_self_portrait boolean default false,
  is_nocturne boolean default false,

  image_url text,                   -- web-quality, from PDF extraction or upload
  image_thumb_url text,             -- 400px wide thumbnail
  image_high_res_url text,          -- print-quality scan, populated when available
  print_ready boolean default false,-- true only when high-res supplied

  source_page_in_book integer,      -- where in the PDF this painting appears
  in_book boolean default false,    -- whether this painting features in the book

  display_order integer,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index paintings_location_idx on paintings(location_id);
create index paintings_featured_idx on paintings(featured) where featured = true;
create index paintings_print_ready_idx on paintings(print_ready) where print_ready = true;
```

### tags

Free-form categorisation orthogonal to the boolean flags on paintings. Many-to-many.

```sql
create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text                     -- 'subject', 'period', 'mood'
);

create table painting_tags (
  painting_id uuid references paintings(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (painting_id, tag_id)
);
```

Suggested initial tag set: pub-and-bar, church, quayside, demolition, character-study, family-interior, paris, london, sketch, finished-work.

### people

Significant people in Charlie's orbit. Aunt Violet, Norman Cornish, Trevor Ermel, Dennis Donnelly, Brian Rankin, Charlie Junior.

```sql
create table people (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text,                        -- 'Wife', 'Father', 'Friend and fellow painter'
  bio_markdown text,
  birth_year integer,
  death_year integer,
  image_url text,
  display_order integer
);
```

### exhibitions

Lifetime and posthumous shows.

```sql
create table exhibitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  venue text not null,
  city text,
  start_date date,
  end_date date,
  description_markdown text,
  is_posthumous boolean default false,
  is_royal_academy boolean default false,
  display_order integer
);

-- Paintings shown at an exhibition
create table exhibition_paintings (
  exhibition_id uuid references exhibitions(id) on delete cascade,
  painting_id uuid references paintings(id) on delete cascade,
  primary key (exhibition_id, painting_id)
);
```

### timeline_events

Biographical events for the timeline view.

```sql
create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer,
  day integer,
  title text not null,
  body_markdown text,
  category text                     -- 'life', 'work', 'exhibition', 'family'
    check (category in ('life', 'work', 'exhibition', 'family')),
  image_url text,
  display_order integer
);

create index timeline_events_year_idx on timeline_events(year);
```

## Commerce

### products

Anything sold on the site. The book, prints, future merchandise.

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('book', 'print', 'merch')),
  title text not null,
  description_markdown text,
  hero_image_url text,
  painting_id uuid references paintings(id),  -- only for type='print'
  stripe_product_id text,
  active boolean default true,
  display_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index products_type_idx on products(type) where active = true;
```

### product_variants

A product has one or more variants. The book has one variant. A print has A4, A3, A2, mounted, framed.

```sql
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  sku text unique not null,
  name text not null,               -- 'A4 Giclée Print, unframed'
  description text,
  price_pence integer not null,
  stripe_price_id text,
  inventory_count integer,          -- null for print-on-demand
  weight_grams integer,             -- shipping calculation
  active boolean default true,
  display_order integer
);
```

### orders

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,         -- 'CR-2026-0001'
  customer_email text not null,
  customer_name text,
  shipping_address jsonb,
  billing_address jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'fulfilled', 'shipped', 'completed', 'cancelled', 'refunded')),
  subtotal_pence integer not null,
  shipping_pence integer not null default 0,
  total_pence integer not null,
  stripe_payment_intent_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index orders_email_idx on orders(customer_email);
create index orders_status_idx on orders(status);
```

### order_items

```sql
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_variant_id uuid references product_variants(id),
  product_snapshot jsonb,           -- title, sku, image at time of order
  quantity integer not null check (quantity > 0),
  unit_price_pence integer not null,
  subtotal_pence integer not null
);
```

## RLS policies

Enable RLS on every table.

Public read, anonymous role:
- `locations`, `paintings`, `tags`, `painting_tags`, `people`, `exhibitions`, `exhibition_paintings`, `timeline_events` — all readable
- `products`, `product_variants` — readable where `active = true`

No public write to anything. All writes go through server-side route handlers using the service role key.

`orders` and `order_items`:
- Customer can read their own orders by matching `customer_email` to a verified session email (Supabase Auth) or by passing a signed token in the URL after checkout
- No public writes; orders are created by the Stripe webhook handler server-side

Admin role policies handled separately, probably by storing an `is_admin` flag on `auth.users.user_metadata` and checking in policies, or by gating admin routes at the application level. Document the choice in `/docs/AUTH.md` when that's built.

## Seed data

The seed file at `/supabase/migrations/seed.sql` should populate, at minimum:

- The 8 locations from `PROJECT.md` (the page 26 starter set)
- The paintings extracted from page 27 of the book that correspond to those locations
- Charlie himself plus Ann, Pop, Charlie Junior, Norman Cornish, Trevor Ermel, Brian Rankin, Dennis Donnelly as `people` rows
- All four Royal Academy years plus the major lifetime and posthumous shows in `exhibitions`
- The full Charlie chronology from the book in `timeline_events`
- The book itself as a `product` with one `product_variant`

The image extraction script (`IMAGE-EXTRACTION.md`) generates a `seed-paintings.sql` from the PDF. Use it.

## Naming and slug conventions

- All slugs lowercase, hyphenated, ASCII only.
- Painting slugs: `{location-slug}-{year}` or `{title-shortened}-{year}` where no location, e.g. `cotfield-street-1973`, `pop-asleep-1968`.
- Location slugs: `{name-shortened}` e.g. `saltwell-park`, `cotfield-street`, `bensham-st-cuthberts`.
- Order numbers: `CR-{YEAR}-{SEQUENCE}` zero-padded to 4 digits.

## Triggers

`updated_at` triggers on every table that has one:

```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger paintings_updated_at before update on paintings
  for each row execute function set_updated_at();
-- repeat for locations, products, product_variants, orders
```
