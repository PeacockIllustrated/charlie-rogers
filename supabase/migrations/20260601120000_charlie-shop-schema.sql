-- Charlie Rogers shop, core schema.
-- All tables prefixed charlie_ to coexist on the shared Supabase instance.
-- Migration: 20260601120000_charlie-shop-schema.sql

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE charlie_product_type AS ENUM (
  'book',
  'print',
  'original',
  'other'
);

CREATE TYPE charlie_product_status AS ENUM (
  'draft',
  'published',
  'sold',
  'archived'
);

-- ============================================================
-- PRODUCTS (core shop listing)
-- ============================================================

CREATE TABLE charlie_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_pence INT NOT NULL CHECK (price_pence >= 0),
  product_type charlie_product_type NOT NULL DEFAULT 'print',
  status charlie_product_status NOT NULL DEFAULT 'draft',
  medium TEXT,             -- 'Giclée print', 'Pen and wash', 'Hardback book'
  dimensions TEXT,         -- '40 x 30 cm', 'A4', '123 pages'
  year_text TEXT,          -- '1973', 'c. 1981', '2025'
  edition TEXT,            -- 'Edition of 50', 'Open edition', 'Unique'
  stock_count INT NOT NULL DEFAULT 1 CHECK (stock_count >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_charlie_products_status ON charlie_products(status);
CREATE INDEX idx_charlie_products_type ON charlie_products(product_type);
CREATE INDEX idx_charlie_products_featured ON charlie_products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_charlie_products_slug ON charlie_products(slug);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE charlie_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES charlie_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_charlie_product_images_product ON charlie_product_images(product_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION charlie_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charlie_products_updated
  BEFORE UPDATE ON charlie_products
  FOR EACH ROW EXECUTE FUNCTION charlie_set_updated_at();

-- ============================================================
-- AUTO-GENERATE SLUG FROM TITLE (when blank)
-- ============================================================

CREATE OR REPLACE FUNCTION charlie_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    NEW.slug = NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charlie_products_slug
  BEFORE INSERT ON charlie_products
  FOR EACH ROW EXECUTE FUNCTION charlie_generate_slug();
