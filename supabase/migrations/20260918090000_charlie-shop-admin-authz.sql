-- Charlie Rogers shop, admin authorisation.
-- Migration: 20260918090000_charlie-shop-admin-authz.sql
--
-- Fixes an authorisation gap. The original policies granted every write on
-- charlie_products, charlie_product_images and the image bucket to anyone
-- satisfying auth.role() = 'authenticated'. CLAUDE.md states this is a shared
-- project database, so that let any signed-in user of any other project on the
-- same instance create, edit, archive and upload against this project's tables.
-- Being signed in is authentication, not authorisation.
--
-- Membership of charlie_admins is now the test. Accounts are added by hand
-- through the Supabase dashboard or the service role, which bypasses RLS, so
-- there is no path for a user to grant themselves access.

-- ============================================================
-- ADMIN ROSTER
-- ============================================================

CREATE TABLE IF NOT EXISTS charlie_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE charlie_admins IS
  'Users permitted to administer the Charlie Rogers shop. Membership is granted only via the service role or the Supabase dashboard, never by the application.';

-- SECURITY DEFINER so the check itself is not subject to row level security.
-- Without this, a policy on charlie_admins that queries charlie_admins
-- recurses. search_path is pinned so the function cannot be redirected at a
-- schema planted by a caller; auth.uid() is schema qualified for the same
-- reason.
CREATE OR REPLACE FUNCTION charlie_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.charlie_admins WHERE user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION charlie_is_admin() IS
  'True when the calling user is on the Charlie Rogers admin roster. Used by every shop write policy.';

REVOKE ALL ON FUNCTION charlie_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION charlie_is_admin() TO authenticated;

ALTER TABLE charlie_admins ENABLE ROW LEVEL SECURITY;

-- Admins may see the roster. Nobody may change it: there is deliberately no
-- insert, update or delete policy, so writes require the service role.
DROP POLICY IF EXISTS charlie_admins_select_admin ON charlie_admins;
CREATE POLICY charlie_admins_select_admin ON charlie_admins
  FOR SELECT TO authenticated USING (charlie_is_admin());

-- ============================================================
-- PRODUCTS AND IMAGES
-- ============================================================

DROP POLICY IF EXISTS charlie_products_select_admin ON charlie_products;
DROP POLICY IF EXISTS charlie_products_insert_admin ON charlie_products;
DROP POLICY IF EXISTS charlie_products_update_admin ON charlie_products;
DROP POLICY IF EXISTS charlie_products_delete_admin ON charlie_products;

CREATE POLICY charlie_products_select_admin ON charlie_products
  FOR SELECT TO authenticated USING (charlie_is_admin());
CREATE POLICY charlie_products_insert_admin ON charlie_products
  FOR INSERT WITH CHECK (charlie_is_admin());
-- USING decides which rows may be updated, WITH CHECK decides what they may
-- become. Both are needed, or an admin check on the read half alone would let
-- a row be updated into a state the policy would otherwise reject.
CREATE POLICY charlie_products_update_admin ON charlie_products
  FOR UPDATE USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
CREATE POLICY charlie_products_delete_admin ON charlie_products
  FOR DELETE USING (charlie_is_admin());

DROP POLICY IF EXISTS charlie_product_images_select_admin ON charlie_product_images;
DROP POLICY IF EXISTS charlie_product_images_insert_admin ON charlie_product_images;
DROP POLICY IF EXISTS charlie_product_images_update_admin ON charlie_product_images;
DROP POLICY IF EXISTS charlie_product_images_delete_admin ON charlie_product_images;

CREATE POLICY charlie_product_images_select_admin ON charlie_product_images
  FOR SELECT TO authenticated USING (charlie_is_admin());
CREATE POLICY charlie_product_images_insert_admin ON charlie_product_images
  FOR INSERT WITH CHECK (charlie_is_admin());
CREATE POLICY charlie_product_images_update_admin ON charlie_product_images
  FOR UPDATE USING (charlie_is_admin()) WITH CHECK (charlie_is_admin());
CREATE POLICY charlie_product_images_delete_admin ON charlie_product_images
  FOR DELETE USING (charlie_is_admin());

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Same gap, same fix. Public read is unchanged: the bucket is public so the
-- site can serve product images without a signed URL.

DROP POLICY IF EXISTS charlie_shop_images_auth_insert ON storage.objects;
DROP POLICY IF EXISTS charlie_shop_images_auth_update ON storage.objects;
DROP POLICY IF EXISTS charlie_shop_images_auth_delete ON storage.objects;

CREATE POLICY charlie_shop_images_admin_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'charlie-shop-images' AND charlie_is_admin());

CREATE POLICY charlie_shop_images_admin_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'charlie-shop-images' AND charlie_is_admin())
  WITH CHECK (bucket_id = 'charlie-shop-images' AND charlie_is_admin());

CREATE POLICY charlie_shop_images_admin_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'charlie-shop-images' AND charlie_is_admin());

-- ============================================================
-- BOOTSTRAP
-- ============================================================
-- The roster starts empty, so after applying this nobody can administer the
-- shop until a first admin is added. Run this once in the SQL editor, which
-- runs as the service role and therefore bypasses the policies above:
--
--   INSERT INTO charlie_admins (user_id, email, note)
--   SELECT id, email, 'first admin'
--   FROM auth.users
--   WHERE email = 'you@example.com'
--   ON CONFLICT (user_id) DO NOTHING;
--
-- Removing an admin is a delete from the same table. Deleting the auth user
-- cascades and removes the roster row with it.
