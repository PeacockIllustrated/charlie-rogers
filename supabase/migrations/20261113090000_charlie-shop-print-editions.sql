-- Charlie Rogers shop: prints go on sale, in their two editions.
-- Migration: 20261113090000_charlie-shop-print-editions.sql
--
-- Tom, 13 November 2026: everything mentioned for sale must be orderable
-- online for Christmas, taken by email until Stripe is added. The book and the
-- cards already were. This adds the prints.
--
-- Why prints can now be sold: CLAUDE.md held them back because the files on
-- the site are around 108ppi. Brian Rankin's email of 12 October 2026 settles
-- that: Paul Wright at the Biscuit Factory prints from his own scans of the
-- originals, so our files are never what is printed.
--
-- 1. charlie_product_options: the choices a product is sold in. Each print
--    gets Brian's two editions (lib/shop/prints.ts): a standard print at £45,
--    made to order (no stock limit), and a limited edition of 50 at £120,
--    counted down as it sells. Prices and stock are editable in the admin,
--    under Editions on each print.
-- 2. Order lines record the edition bought.
-- 3. Fish Market, Quayside, Newcastle (1979), the fifth painting on Brian's
--    Charlie Rogers Collection info sheet, is listed.
-- 4. charlie_place_order sells prints, pricing and counting each from its
--    edition. Same signature, so the site's call does not change.
-- 5. Cancelling an order gives limited edition stock back too.
--
-- Run after 20261012090000, 20261013090000 and 20261023090000. Idempotent:
-- safe to re-run. The NOTIFY at the end reloads the API's schema cache.

-- ============================================================
-- 1. PRODUCT OPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS charlie_product_options (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES charlie_products(id) ON DELETE CASCADE,
  -- Stable key used in the basket and on order lines.
  code           text NOT NULL CHECK (code ~ '^[a-z0-9-]{1,40}$'),
  name           text NOT NULL,
  detail         text,
  price_pence    int NOT NULL CHECK (price_pence >= 0),
  -- Null means made to order: no limit beyond the per-order cap.
  stock_count    int CHECK (stock_count IS NULL OR stock_count >= 0),
  display_order  int NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, code)
);

CREATE INDEX IF NOT EXISTS idx_charlie_product_options_product ON charlie_product_options(product_id);

DROP TRIGGER IF EXISTS charlie_product_options_updated ON charlie_product_options;
CREATE TRIGGER charlie_product_options_updated
  BEFORE UPDATE ON charlie_product_options
  FOR EACH ROW EXECUTE FUNCTION charlie_set_updated_at();

ALTER TABLE charlie_product_options ENABLE ROW LEVEL SECURITY;

-- Anyone may read the options of a listed product, as for its images.
DROP POLICY IF EXISTS charlie_product_options_select_public ON charlie_product_options;
CREATE POLICY charlie_product_options_select_public ON charlie_product_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM charlie_products
      WHERE charlie_products.id = charlie_product_options.product_id
      AND charlie_products.status IN ('published', 'sold')
    )
  );

-- Writes, and reads of unlisted products, need the admin roster.
DROP POLICY IF EXISTS charlie_product_options_select_admin ON charlie_product_options;
CREATE POLICY charlie_product_options_select_admin ON charlie_product_options
  FOR SELECT TO authenticated USING (charlie_is_admin());
DROP POLICY IF EXISTS charlie_product_options_insert_admin ON charlie_product_options;
CREATE POLICY charlie_product_options_insert_admin ON charlie_product_options
  FOR INSERT TO authenticated WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_product_options_update_admin ON charlie_product_options;
CREATE POLICY charlie_product_options_update_admin ON charlie_product_options
  FOR UPDATE TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_product_options_delete_admin ON charlie_product_options;
CREATE POLICY charlie_product_options_delete_admin ON charlie_product_options
  FOR DELETE TO authenticated USING (charlie_is_admin());

-- ============================================================
-- 2. ORDER LINES RECORD THE EDITION
-- ============================================================

ALTER TABLE charlie_order_items ADD COLUMN IF NOT EXISTS option_code text;
ALTER TABLE charlie_order_items ADD COLUMN IF NOT EXISTS option_name text;

-- ============================================================
-- 3. FISH MARKET, QUAYSIDE, NEWCASTLE
-- ============================================================

INSERT INTO charlie_products
  (title, slug, description, price_pence, product_type, status, medium, dimensions, year_text, edition, stock_count, is_featured)
VALUES
  ('Fish Market, Quayside, Newcastle', 'fish-market-quayside-newcastle-1979',
   'Charlie’s 1979 painting of the Fish Market on Newcastle Quayside, in watercolour and pen. Reproduced in Pursued by Bulldozers.',
   4500, 'print', 'published', 'Watercolour and pen', '40.6 x 50.8 cm (16 x 20 in)', '1979',
   'Standard print, or limited edition of 50', 0, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, '/paintings/web/page_076_img_000.jpg',
  'Fish Market, Quayside, Newcastle, 1979: a statue group on a pediment above an arched gateway on the Newcastle Quayside, figures at the foot.',
  0, true
FROM charlie_products p
WHERE p.slug = 'fish-market-quayside-newcastle-1979'
  AND NOT EXISTS (SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id);

-- ============================================================
-- 1b. EVERY PRICED PRINT GETS THE TWO EDITIONS
-- ============================================================
-- Town Moor is unpriced (not on the info sheet), so it gets none and stays
-- by enquiry. Editions already present are left alone, so a price or stock
-- changed in the admin survives a re-run.

INSERT INTO charlie_product_options (product_id, code, name, detail, price_pence, stock_count, display_order)
SELECT p.id, e.code, e.name, e.detail, e.price_pence, e.stock_count, e.display_order
FROM charlie_products p
CROSS JOIN (VALUES
  ('standard', 'Standard print', 'Giclée print', 4500, NULL::int, 0),
  ('limited', 'Limited edition', 'Edition of 50, giclée, mounted, with a certificate of authenticity', 12000, 50, 1)
) AS e(code, name, detail, price_pence, stock_count, display_order)
WHERE p.product_type = 'print'
  AND p.price_pence > 0
ON CONFLICT (product_id, code) DO NOTHING;

-- ============================================================
-- 4. PLACE ORDER, NOW WITH PRINTS
-- ============================================================
--
-- p_items is a JSON array of {"slug": text, "option": text|null, "quantity": int}.
-- A product with active options must be ordered as one of them; its price and
-- stock come from the option. Anything else is priced and counted as before.
-- Originals are never sold here.
--
-- Raises the same stable prefixes as before:
--   charlie_order:empty, charlie_order:unavailable:<slug>,
--   charlie_order:stock:<slug>, charlie_order:price_changed

CREATE OR REPLACE FUNCTION charlie_place_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_notes text,
  p_items jsonb,
  p_postage_pence int,
  p_expected_subtotal_pence int,
  p_payment_provider text
)
RETURNS TABLE (order_id uuid, order_number text, access_token text, total_pence int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id uuid;
  v_number text;
  v_token text;
  v_subtotal int := 0;
  v_total int;
  v_item record;
  v_line record;
  v_product charlie_products%ROWTYPE;
  v_option charlie_product_options%ROWTYPE;
  v_has_options boolean;
  v_unit int;
  v_lines jsonb := '[]'::jsonb;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'charlie_order:empty';
  END IF;

  -- Lock each product row, then its option row, in slug and option order so
  -- two concurrent orders cannot deadlock on each other. Duplicates are summed
  -- first so a line cannot dodge the stock check by being split.
  FOR v_item IN
    SELECT i.slug, coalesce(i.option, '') AS option, sum(i.quantity)::int AS quantity
    FROM jsonb_to_recordset(p_items) AS i(slug text, option text, quantity int)
    GROUP BY i.slug, coalesce(i.option, '')
    ORDER BY i.slug, coalesce(i.option, '')
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity < 1 THEN
      RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
    END IF;

    SELECT * INTO v_product FROM charlie_products p WHERE p.slug = v_item.slug FOR UPDATE;

    IF NOT FOUND
      OR v_product.status <> 'published'
      OR v_product.product_type NOT IN ('book', 'other', 'print') THEN
      RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM charlie_product_options o
      WHERE o.product_id = v_product.id AND o.is_active AND o.price_pence > 0
    ) INTO v_has_options;

    IF v_has_options THEN
      SELECT * INTO v_option FROM charlie_product_options o
      WHERE o.product_id = v_product.id AND o.code = v_item.option
        AND o.is_active AND o.price_pence > 0
      FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
      END IF;
      IF v_option.stock_count IS NOT NULL AND v_option.stock_count < v_item.quantity THEN
        RAISE EXCEPTION 'charlie_order:stock:%', v_item.slug;
      END IF;
      v_unit := v_option.price_pence;
      v_lines := v_lines || jsonb_build_object(
        'product_id', v_product.id, 'slug', v_product.slug, 'title', v_product.title,
        'type', v_product.product_type, 'option_code', v_option.code, 'option_name', v_option.name,
        'quantity', v_item.quantity, 'unit', v_unit);
    ELSE
      -- A print with no editions has nothing to be sold at.
      IF v_item.option <> '' OR v_product.product_type = 'print' OR v_product.price_pence <= 0 THEN
        RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
      END IF;
      IF v_product.stock_count < v_item.quantity THEN
        RAISE EXCEPTION 'charlie_order:stock:%', v_item.slug;
      END IF;
      v_unit := v_product.price_pence;
      v_lines := v_lines || jsonb_build_object(
        'product_id', v_product.id, 'slug', v_product.slug, 'title', v_product.title,
        'type', v_product.product_type, 'option_code', NULL, 'option_name', NULL,
        'quantity', v_item.quantity, 'unit', v_unit);
    END IF;

    v_subtotal := v_subtotal + v_unit * v_item.quantity;
  END LOOP;

  IF v_subtotal <> p_expected_subtotal_pence THEN
    RAISE EXCEPTION 'charlie_order:price_changed';
  END IF;

  v_total := v_subtotal + coalesce(p_postage_pence, 0);
  v_number := 'CR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('charlie_order_number_seq')::text, 4, '0');

  INSERT INTO charlie_orders (
    order_number, status, customer_name, customer_email, customer_phone,
    shipping_address, notes, subtotal_pence, postage_pence, total_pence,
    payment_provider
  ) VALUES (
    v_number, 'pending', p_customer_name, lower(p_customer_email), p_customer_phone,
    p_shipping_address, p_notes, v_subtotal, p_postage_pence, v_total,
    p_payment_provider
  )
  RETURNING charlie_orders.id, charlie_orders.access_token INTO v_order_id, v_token;

  -- Second pass writes the lines and takes the stock. The rows are already
  -- locked, so nothing can have changed between the two passes.
  FOR v_line IN
    SELECT * FROM jsonb_to_recordset(v_lines) AS l(
      product_id uuid, slug text, title text, type charlie_product_type,
      option_code text, option_name text, quantity int, unit int)
  LOOP
    INSERT INTO charlie_order_items (
      order_id, product_id, product_slug, product_title, product_type,
      option_code, option_name, quantity, unit_price_pence, line_total_pence
    ) VALUES (
      v_order_id, v_line.product_id, v_line.slug, v_line.title, v_line.type,
      v_line.option_code, v_line.option_name, v_line.quantity, v_line.unit, v_line.unit * v_line.quantity
    );

    IF v_line.option_code IS NULL THEN
      UPDATE charlie_products SET stock_count = stock_count - v_line.quantity
      WHERE id = v_line.product_id;
    ELSE
      UPDATE charlie_product_options SET stock_count = stock_count - v_line.quantity
      WHERE product_id = v_line.product_id AND code = v_line.option_code AND stock_count IS NOT NULL;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_order_id, v_number, v_token, v_total;
END;
$$;

COMMENT ON FUNCTION charlie_place_order IS
  'Places a Charlie Rogers shop order: re-prices from charlie_products and charlie_product_options, checks availability and stock, reserves stock, writes the order. Service role only.';

REVOKE ALL ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) TO service_role;

-- ============================================================
-- 5. CANCELLING RETURNS EDITION STOCK TOO
-- ============================================================

CREATE OR REPLACE FUNCTION charlie_order_return_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE charlie_products p
    SET stock_count = p.stock_count + i.quantity
    FROM charlie_order_items i
    WHERE i.order_id = NEW.id AND i.product_id = p.id AND i.option_code IS NULL;

    -- Made to order editions have no count to return.
    UPDATE charlie_product_options o
    SET stock_count = o.stock_count + i.quantity
    FROM charlie_order_items i
    WHERE i.order_id = NEW.id AND i.product_id = o.product_id
      AND i.option_code = o.code AND o.stock_count IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
