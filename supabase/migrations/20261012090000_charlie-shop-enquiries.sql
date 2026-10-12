-- Charlie Rogers shop, enquiries.
-- Migration: 20261012090000_charlie-shop-enquiries.sql
--
-- Everything in the shop that cannot be put in the basket (the paintings
-- always, the book and the cards while the checkout is closed) is by enquiry.
-- Until now that meant a mailto link to NEXT_PUBLIC_ENQUIRY_EMAIL, which was
-- never set, so the product pages said "no enquiry address has been set" and
-- offered nothing. This adds a table the product page form writes to, read by
-- the admins at /admin/enquiries. The admin is also emailed, at the address in
-- Settings, when the hosting environment can send email.
--
-- Same model as the orders tables: no public policy at all. Enquiries are
-- written only by the server through the service role, after validation, and
-- read and updated only by an admin on the charlie_admins roster.
--
-- Depends on charlie_is_admin() (20260918090000) and charlie_products.
-- Safe to run twice.

CREATE TABLE IF NOT EXISTS charlie_enquiries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Kept if the listing is later deleted: the slug and title below still say
  -- what was asked about.
  product_id     uuid REFERENCES charlie_products(id) ON DELETE SET NULL,
  product_slug   text NOT NULL,
  product_title  text NOT NULL,
  name           text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email          text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone          text CHECK (phone IS NULL OR char_length(phone) <= 30),
  message        text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  status         text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'replied', 'closed')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS charlie_enquiries_status_created_idx
  ON charlie_enquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS charlie_enquiries_email_created_idx
  ON charlie_enquiries (email, created_at DESC);

CREATE OR REPLACE FUNCTION charlie_enquiries_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS charlie_enquiries_touch_trg ON charlie_enquiries;
CREATE TRIGGER charlie_enquiries_touch_trg
  BEFORE UPDATE ON charlie_enquiries
  FOR EACH ROW EXECUTE FUNCTION charlie_enquiries_touch();

ALTER TABLE charlie_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS charlie_enquiries_select_admin ON charlie_enquiries;
CREATE POLICY charlie_enquiries_select_admin ON charlie_enquiries FOR SELECT
  TO authenticated USING (charlie_is_admin());

DROP POLICY IF EXISTS charlie_enquiries_update_admin ON charlie_enquiries;
CREATE POLICY charlie_enquiries_update_admin ON charlie_enquiries FOR UPDATE
  TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
