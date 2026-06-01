-- Charlie Rogers shop, Row Level Security.
-- Migration: 20260601120001_charlie-shop-rls.sql
--
-- Public (anon) can read only published/sold products and their images.
-- All writes require an authenticated admin user. Service-role bypasses RLS for
-- trusted server code (image upload/cleanup).

ALTER TABLE charlie_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_product_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ
-- ============================================================

CREATE POLICY charlie_products_select_public ON charlie_products FOR SELECT
  USING (status IN ('published', 'sold'));

CREATE POLICY charlie_product_images_select_public ON charlie_product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM charlie_products
      WHERE charlie_products.id = charlie_product_images.product_id
      AND charlie_products.status IN ('published', 'sold')
    )
  );

-- ============================================================
-- ADMIN (authenticated) FULL ACCESS
-- ============================================================

CREATE POLICY charlie_products_select_admin ON charlie_products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY charlie_products_insert_admin ON charlie_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY charlie_products_update_admin ON charlie_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY charlie_products_delete_admin ON charlie_products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY charlie_product_images_select_admin ON charlie_product_images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY charlie_product_images_insert_admin ON charlie_product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY charlie_product_images_update_admin ON charlie_product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY charlie_product_images_delete_admin ON charlie_product_images FOR DELETE USING (auth.role() = 'authenticated');
