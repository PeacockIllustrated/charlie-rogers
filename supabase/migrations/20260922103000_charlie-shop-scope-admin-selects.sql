-- Charlie Rogers shop, scope the admin read policies to authenticated.
-- Migration: 20260922103000_charlie-shop-scope-admin-selects.sql
--
-- 20260918090000_charlie-shop-admin-authz.sql was applied to the live database
-- on 18 September in an earlier form, before review, and its admin SELECT
-- policies were created without a TO clause. A policy with no TO clause is
-- evaluated for every role, including anon, so an anonymous read of
-- charlie_products can be made to call charlie_is_admin(). That file was then
-- corrected in the repository, which left the database a version behind it.
-- This migration carries the correction forward rather than editing history.
--
-- Why it matters: EXECUTE on charlie_is_admin() is meant for authenticated
-- only. Where anon lacks it, an anonymous catalogue read raises
--   ERROR: permission denied for function charlie_is_admin
-- Whether it raises is plan dependent, because Postgres may short circuit the
-- OR of two permissive policies and never reach the admin one. That is why
-- anonymous reads have been succeeding here. A query plan is not an
-- authorisation boundary, so this does not make the unscoped policy safe; it
-- makes the failure intermittent, which is worse.

-- ============================================================
-- SCOPE THE ADMIN READ POLICIES
-- ============================================================
-- The matching public read policies are untouched. They carry no TO clause on
-- purpose, because anonymous visitors are exactly who they are for, and they
-- test status rather than calling any function.

DROP POLICY IF EXISTS charlie_products_select_admin ON charlie_products;
CREATE POLICY charlie_products_select_admin ON charlie_products
  FOR SELECT TO authenticated USING (charlie_is_admin());

DROP POLICY IF EXISTS charlie_product_images_select_admin ON charlie_product_images;
CREATE POLICY charlie_product_images_select_admin ON charlie_product_images
  FOR SELECT TO authenticated USING (charlie_is_admin());

DROP POLICY IF EXISTS charlie_admins_select_admin ON charlie_admins;
CREATE POLICY charlie_admins_select_admin ON charlie_admins
  FOR SELECT TO authenticated USING (charlie_is_admin());

-- ============================================================
-- REVOKE THE FUNCTION FROM ANON
-- ============================================================
-- The authz migration revoked from PUBLIC and granted to authenticated. It did
-- not remove anon's own grant, which Supabase creates by default privilege, so
-- anon still holds EXECUTE on the live database. Nothing anon can reach calls
-- the function now, so take the grant away as well: the policy scoping above
-- and this revoke each close the hole on their own.

REVOKE ALL ON FUNCTION charlie_is_admin() FROM anon;

-- ============================================================
-- SCOPE THE WRITE POLICIES TOO
-- ============================================================
-- Measured after the changes above, on the live database: an anonymous INSERT
-- into charlie_products was refused with
--   42501 permission denied for function charlie_is_admin
-- while a signed-in non-admin was refused with the clean
--   42501 new row violates row-level security policy for table "charlie_products"
--
-- Both are refusals, so neither is a hole. But the anon one is refused only
-- because the function grant happens to be missing, not because a policy said
-- no, and it is the same unscoped-policy shape the review caught on the read
-- side. Anonymous visitors have no business reaching an admin policy at all.
-- Scoping these makes the refusal come from row level security in both cases.

DROP POLICY IF EXISTS charlie_products_insert_admin ON charlie_products;
CREATE POLICY charlie_products_insert_admin ON charlie_products
  FOR INSERT TO authenticated WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_products_update_admin ON charlie_products;
CREATE POLICY charlie_products_update_admin ON charlie_products
  FOR UPDATE TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_products_delete_admin ON charlie_products;
CREATE POLICY charlie_products_delete_admin ON charlie_products
  FOR DELETE TO authenticated USING (charlie_is_admin());

DROP POLICY IF EXISTS charlie_product_images_insert_admin ON charlie_product_images;
CREATE POLICY charlie_product_images_insert_admin ON charlie_product_images
  FOR INSERT TO authenticated WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_product_images_update_admin ON charlie_product_images;
CREATE POLICY charlie_product_images_update_admin ON charlie_product_images
  FOR UPDATE TO authenticated USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
DROP POLICY IF EXISTS charlie_product_images_delete_admin ON charlie_product_images;
CREATE POLICY charlie_product_images_delete_admin ON charlie_product_images
  FOR DELETE TO authenticated USING (charlie_is_admin());

-- Same shape on the image bucket. Public read is untouched.
DROP POLICY IF EXISTS charlie_shop_images_admin_insert ON storage.objects;
CREATE POLICY charlie_shop_images_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'charlie-shop-images' AND charlie_is_admin());
DROP POLICY IF EXISTS charlie_shop_images_admin_update ON storage.objects;
CREATE POLICY charlie_shop_images_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'charlie-shop-images' AND charlie_is_admin())
  WITH CHECK (bucket_id = 'charlie-shop-images' AND charlie_is_admin());
DROP POLICY IF EXISTS charlie_shop_images_admin_delete ON storage.objects;
CREATE POLICY charlie_shop_images_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'charlie-shop-images' AND charlie_is_admin());
