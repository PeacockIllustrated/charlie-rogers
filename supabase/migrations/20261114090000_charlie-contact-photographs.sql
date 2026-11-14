-- Charlie Rogers, contact page photographs.
-- Migration: 20261114090000_charlie-contact-photographs.sql
--
-- The contact page lets someone send up to three photographs with a message,
-- for the back catalogue, authentication or a story about Charlie. They are
-- stored here and Brian Rankin is emailed a signed link to each.
--
-- The bucket is private: no public URL and no storage policy at all, so only
-- the server (service role) can write to it or sign a link. Files are limited
-- to small images; the browser shrinks each one before sending.
--
-- Messages themselves need nothing new: they are kept in charlie_enquiries
-- (20261012090000) with a product_slug starting "contact-".
-- Safe to run twice.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'charlie-contact',
  'charlie-contact',
  false,
  1500000,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
