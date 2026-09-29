-- Give Pop and the greeting card pack their images on the live instance.
--
-- Both were added to supabase/seed-shop.sql on 24 September 2026, after that
-- file had already been applied here on 18 September. The seed's image inserts
-- are guarded on the product having no image at all, and these two had none,
-- but the seed was never re-run, so the live shop still shows "Image to come"
-- on both. 20260924071500_charlie-shop-copy-corrections.sql fixed the copy and
-- did not touch images.
--
-- Same guard as the seed: if a product already has any image, for example one
-- uploaded through the admin since, nothing is inserted for it. Safe to run
-- twice.

INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, '/artwork/web/pop-1967.jpg', 'Watercolour of the Rogers family living room with a bottle of Brown Ale, 1967', 0, true
FROM charlie_products p
WHERE p.slug = 'pop-1967'
  AND NOT EXISTS (
    SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id
  );

INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, v.path, v.alt, v.ord, v.ord = 0
FROM (VALUES
  (0, '/artwork/cards/the-monument-with-snow-newcastle-on-tyne-1996.jpg', 'The Monument with Snow, Newcastle-on-Tyne, 1996, watercolour'),
  (1, '/artwork/cards/st-cuthberts-church-gateshead-on-tyne-1982.jpg', 'St Cuthbert''s Church, Gateshead-on-Tyne, 1982, oil'),
  (2, '/artwork/cards/bensham-road-gateshead-1970.jpg', 'Bensham Road, Gateshead, 1970, watercolour'),
  (3, '/artwork/cards/street-meeting-with-snow-gateshead-1972.jpg', 'Street meeting with snow, Gateshead, 1972, watercolour'),
  (4, '/artwork/cards/cotfield-street-bensham-gateshead.jpg', 'Cotfield Street, Bensham, Gateshead-on-Tyne, watercolour')
) AS v(ord, path, alt)
JOIN charlie_products p ON p.slug = 'greeting-card-collection'
WHERE NOT EXISTS (
  SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id
);
