-- Charlie Rogers shop, storage bucket for product images.
-- Migration: 20260601120002_charlie-shop-storage.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'charlie-shop-images',
  'charlie-shop-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read.
CREATE POLICY charlie_shop_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'charlie-shop-images');

-- Authenticated write.
CREATE POLICY charlie_shop_images_auth_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'charlie-shop-images' AND auth.role() = 'authenticated');

CREATE POLICY charlie_shop_images_auth_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'charlie-shop-images' AND auth.role() = 'authenticated');

CREATE POLICY charlie_shop_images_auth_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'charlie-shop-images' AND auth.role() = 'authenticated');
