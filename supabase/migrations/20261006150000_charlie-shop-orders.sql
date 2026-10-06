-- Charlie Rogers shop, orders.
-- Migration: 20261006150000_charlie-shop-orders.sql
--
-- Adds orders and order items, and one function that places an order. The
-- function is the only way an order is written: it re-reads every price from
-- charlie_products, checks the product can be sold, locks and decrements stock,
-- and writes the order and its lines in one transaction. Nothing the browser
-- sends is trusted for price or availability.
--
-- Payment is deliberately not modelled beyond a provider name and a reference.
-- An order is placed as 'pending' and moves to 'paid' when payment is taken,
-- whether that is by hand (the manual provider) or, later, by a Stripe webhook.
-- See docs/SHOP.md, "Checkout and payment".

-- ============================================================
-- ORDERS
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS charlie_order_number_seq;

CREATE TABLE charlie_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- CR-2026-0001, per docs/SCHEMA.md.
  order_number      text NOT NULL UNIQUE,
  -- Unguessable token that lets the customer see their own confirmation page
  -- without an account. Never listed, only ever matched.
  -- Two v4 UUIDs, 244 random bits. gen_random_uuid() is core Postgres, so
  -- this does not depend on which schema pgcrypto is installed in.
  access_token      text NOT NULL DEFAULT
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')),
  customer_name     text NOT NULL,
  customer_email    text NOT NULL,
  customer_phone    text,
  shipping_address  jsonb NOT NULL,
  notes             text,
  subtotal_pence    int NOT NULL CHECK (subtotal_pence >= 0),
  -- Null while postage has not been set, so a total is never shown as final
  -- when it is not.
  postage_pence     int CHECK (postage_pence >= 0),
  total_pence       int NOT NULL CHECK (total_pence >= 0),
  currency          text NOT NULL DEFAULT 'gbp',
  payment_provider  text NOT NULL DEFAULT 'manual',
  -- Stripe Checkout session or payment intent id, once wired.
  payment_reference text,
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_charlie_orders_status ON charlie_orders(status);
CREATE INDEX idx_charlie_orders_email ON charlie_orders(customer_email);
CREATE INDEX idx_charlie_orders_created ON charlie_orders(created_at DESC);

CREATE TRIGGER charlie_orders_updated
  BEFORE UPDATE ON charlie_orders
  FOR EACH ROW EXECUTE FUNCTION charlie_set_updated_at();

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE charlie_order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES charlie_orders(id) ON DELETE CASCADE,
  -- SET NULL so archiving or deleting a listing never deletes order history.
  product_id       uuid REFERENCES charlie_products(id) ON DELETE SET NULL,
  -- What was bought, as it was at the time. Titles and prices change.
  product_slug     text NOT NULL,
  product_title    text NOT NULL,
  product_type     charlie_product_type NOT NULL,
  quantity         int NOT NULL CHECK (quantity > 0),
  unit_price_pence int NOT NULL CHECK (unit_price_pence >= 0),
  line_total_pence int NOT NULL CHECK (line_total_pence >= 0)
);

CREATE INDEX idx_charlie_order_items_order ON charlie_order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
--
-- No public policy at all. Customers never read these tables directly: the
-- confirmation page reads through the service role after matching the order
-- number and access token. Admins on the roster may read and update status.

ALTER TABLE charlie_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY charlie_orders_select_admin ON charlie_orders FOR SELECT
  TO authenticated USING (charlie_is_admin());
CREATE POLICY charlie_orders_update_admin ON charlie_orders FOR UPDATE
  TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
CREATE POLICY charlie_order_items_select_admin ON charlie_order_items FOR SELECT
  TO authenticated USING (charlie_is_admin());

-- ============================================================
-- PLACE ORDER
-- ============================================================
--
-- p_items is a JSON array of {"slug": text, "quantity": int}.
-- p_expected_subtotal_pence is the subtotal the customer was shown. If prices
-- have moved since, the order is refused rather than charged at a figure the
-- customer never saw.
--
-- Raises with a stable message prefix the app maps to plain English:
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
  v_product charlie_products%ROWTYPE;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'charlie_order:empty';
  END IF;

  -- Lock each product row for the life of the transaction, in slug order so
  -- two concurrent orders cannot deadlock on each other. Duplicate slugs are
  -- summed first so a line cannot dodge the stock check by being split.
  FOR v_item IN
    SELECT i.slug, sum(i.quantity)::int AS quantity
    FROM jsonb_to_recordset(p_items) AS i(slug text, quantity int)
    GROUP BY i.slug
    ORDER BY i.slug
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity < 1 THEN
      RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
    END IF;

    SELECT * INTO v_product FROM charlie_products p WHERE p.slug = v_item.slug FOR UPDATE;

    -- Prints and originals are never sold online from these files: the
    -- supplied images are not print quality. See CLAUDE.md.
    IF NOT FOUND
      OR v_product.status <> 'published'
      OR v_product.price_pence <= 0
      OR v_product.product_type NOT IN ('book', 'other') THEN
      RAISE EXCEPTION 'charlie_order:unavailable:%', v_item.slug;
    END IF;

    IF v_product.stock_count < v_item.quantity THEN
      RAISE EXCEPTION 'charlie_order:stock:%', v_item.slug;
    END IF;

    v_subtotal := v_subtotal + v_product.price_pence * v_item.quantity;
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
  INSERT INTO charlie_order_items (
    order_id, product_id, product_slug, product_title, product_type,
    quantity, unit_price_pence, line_total_pence
  )
  SELECT v_order_id, p.id, p.slug, p.title, p.product_type,
         i.quantity, p.price_pence, p.price_pence * i.quantity
  FROM (
    SELECT slug, sum(quantity)::int AS quantity
    FROM jsonb_to_recordset(p_items) AS x(slug text, quantity int)
    GROUP BY slug
  ) i
  JOIN charlie_products p ON p.slug = i.slug;

  UPDATE charlie_products p
  SET stock_count = p.stock_count - i.quantity
  FROM (
    SELECT slug, sum(quantity)::int AS quantity
    FROM jsonb_to_recordset(p_items) AS x(slug text, quantity int)
    GROUP BY slug
  ) i
  WHERE p.slug = i.slug;

  RETURN QUERY SELECT v_order_id, v_number, v_token, v_total;
END;
$$;

COMMENT ON FUNCTION charlie_place_order IS
  'Places a Charlie Rogers shop order: re-prices from charlie_products, checks availability and stock, reserves stock, writes the order. Service role only.';

-- Only trusted server code may place an order. The checkout server action
-- calls this through the service role after validating the customer details.
REVOKE ALL ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION charlie_place_order(text, text, text, jsonb, text, jsonb, int, int, text) TO service_role;

-- ============================================================
-- RETURN STOCK ON CANCELLATION
-- ============================================================
--
-- Stock is taken when the order is placed, so a cancelled order has to give it
-- back, or the limited edition quietly shrinks. A refund does not: by then the
-- copy has usually been posted, and a returned one can be added back by hand. Done in a
-- trigger so it happens however the status is changed: the admin, the SQL
-- editor, or a future Stripe webhook for an abandoned payment.

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
    WHERE i.order_id = NEW.id AND i.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER charlie_orders_return_stock
  AFTER UPDATE OF status ON charlie_orders
  FOR EACH ROW EXECUTE FUNCTION charlie_order_return_stock();

-- A cancelled order stays cancelled. Reopening it would need the stock taken
-- again, with no check that any is left, so it is refused outright; place a
-- new order instead.
CREATE OR REPLACE FUNCTION charlie_order_no_reopen()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status = 'cancelled' AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'charlie_order:closed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER charlie_orders_no_reopen
  BEFORE UPDATE OF status ON charlie_orders
  FOR EACH ROW EXECUTE FUNCTION charlie_order_no_reopen();

-- ============================================================
-- STOCK FOR THE TWO SALEABLE PRODUCTS
-- ============================================================
--
-- The seed left stock_count at the column default of 1, which would sell out
-- the special edition after a single copy. Brian Rankin set the edition at 100
-- copies. The card pack has no stated print run, so it is given the same 100
-- as a placeholder until he confirms one. Only touches rows still at the
-- default, so a count already set by hand in the admin is left alone.

UPDATE charlie_products SET stock_count = 100
WHERE slug IN ('pursued-by-bulldozers-special-edition', 'greeting-card-collection')
  AND stock_count = 1;

-- ============================================================
-- SHOP SETTINGS
-- ============================================================
--
-- The checkout switch, UK postage and the order notification address, edited
-- from /admin/settings so they change without a redeploy. One row only: the
-- primary key is a boolean that must be true.
--
-- No public policy. The notification address is private, so the site reads
-- this through the service role on the server; admins on the roster read and
-- update it through their own session. Secrets (the Resend key, and later the
-- Stripe keys) stay in the hosting environment and never come here.

CREATE TABLE charlie_shop_settings (
  id                    boolean PRIMARY KEY DEFAULT true CHECK (id),
  -- 'stripe' is accepted so the column need not change when it is built; the
  -- app treats it as closed until a Stripe provider exists.
  checkout_mode         text NOT NULL DEFAULT 'closed'
    CHECK (checkout_mode IN ('closed', 'manual', 'stripe')),
  -- Null means postage is to be confirmed.
  uk_postage_pence      int CHECK (uk_postage_pence >= 0 AND uk_postage_pence <= 10000),
  order_notify_email    text CHECK (order_notify_email IS NULL OR order_notify_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  updated_by            uuid
);

CREATE TRIGGER charlie_shop_settings_updated
  BEFORE UPDATE ON charlie_shop_settings
  FOR EACH ROW EXECUTE FUNCTION charlie_set_updated_at();

INSERT INTO charlie_shop_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE charlie_shop_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY charlie_shop_settings_select_admin ON charlie_shop_settings FOR SELECT
  TO authenticated USING (charlie_is_admin());
CREATE POLICY charlie_shop_settings_update_admin ON charlie_shop_settings FOR UPDATE
  TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
