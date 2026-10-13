-- Charlie Rogers shop: the prints and single cards Brian Rankin set out on
-- 12 October 2026. Mirrors lib/shop/catalogue.ts and lib/shop/prints.ts.
-- Idempotent: safe to re-run.
--
-- 1. The eight paintings already listed that are on his Charlie Rogers
--    Collection info sheet become priced prints: 40.6 x 50.8cm, a standard
--    print at £45 or a limited edition of 50 at £120, delivered free. The row
--    holds the lower price and the site shows "From £45.00". Town Moor is not
--    on the sheet and is left as it is, price on application.
-- 2. Street Meeting with Snow, on the sheet but not yet listed, is added.
-- 3. Each of the five card designs is added as a single card at £2.95,
--    including the envelope. Stock is a placeholder 100, as for the pack.
--
-- Prints stay by enquiry: charlie_place_order still sells only 'book' and
-- 'other', so nothing here opens a print purchase.
--
-- Run 20261012090000_charlie-shop-enquiries.sql first if charlie_enquiries
-- does not exist yet. The NOTIFY at the end reloads the API's schema cache,
-- which is what "Could not find the table 'public.charlie_enquiries' in the
-- schema cache" asks for.

UPDATE charlie_products
SET price_pence = 4500,
    dimensions = '40.6 x 50.8 cm (16 x 20 in)',
    edition = 'Standard print, or limited edition of 50',
    updated_at = now()
WHERE product_type = 'print'
  AND slug IN (
    'bigg-market-newcastle-on-tyne-1975',
    'the-joke-shop-gateshead-on-tyne-1966',
    'the-men-on-the-seats-1973',
    'third-street-back-lane-bensham-gateshead-1980',
    'four-doors-at-school-street-gateshead-1977',
    'bensham-road-gateshead-1970',
    'pot-pie-bobs-wellington-street-gateshead-1977',
    'pop-1967'
  );

INSERT INTO charlie_products
  (title, slug, description, price_pence, product_type, status, medium, dimensions, year_text, edition, stock_count, is_featured)
VALUES
  ('Street Meeting with Snow, Gateshead', 'street-meeting-with-snow-gateshead-1972',
   'Accepted for the Royal Academy Summer Exhibition in 1972, the second of Charlie’s four paintings to hang there.',
   4500, 'print', 'published', 'Watercolour', '40.6 x 50.8 cm (16 x 20 in)', '1972', 'Standard print, or limited edition of 50', 0, false),
  ('Greeting card, The Monument with Snow, Newcastle-on-Tyne', 'greeting-card-the-monument-with-snow-newcastle-on-tyne-1996',
   'A single greeting card of The Monument with Snow, Newcastle-on-Tyne 1996, from the greeting card collection. £2.95 including the envelope.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, St Cuthbert’s Church, Gateshead-on-Tyne', 'greeting-card-st-cuthberts-church-gateshead-on-tyne-1982',
   'A single greeting card of St Cuthbert’s Church, Gateshead-on-Tyne 1982, from the greeting card collection. £2.95 including the envelope.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Bensham Road, Gateshead', 'greeting-card-bensham-road-gateshead-1970',
   'A single greeting card of Bensham Road, Gateshead 1970, from the greeting card collection. £2.95 including the envelope.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Street meeting with snow, Gateshead', 'greeting-card-street-meeting-with-snow-gateshead-1972',
   'A single greeting card of Street meeting with snow, Gateshead 1972, from the greeting card collection. £2.95 including the envelope.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Cotfield Street, Bensham, Gateshead-on-Tyne', 'greeting-card-cotfield-street-bensham-gateshead',
   'A single greeting card of Cotfield Street, Bensham, Gateshead-on-Tyne, from the greeting card collection. £2.95 including the envelope.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false)
ON CONFLICT (slug) DO NOTHING;

-- One picture each, only where the product has none, so a picture replaced
-- in the admin is left alone.
INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, v.path, v.alt, 0, true
FROM (VALUES
  ('street-meeting-with-snow-gateshead-1972', '/artwork/cards/street-meeting-with-snow-gateshead-1972.jpg', 'Street meeting with snow, Gateshead, 1972, watercolour'),
  ('greeting-card-the-monument-with-snow-newcastle-on-tyne-1996', '/artwork/cards/the-monument-with-snow-newcastle-on-tyne-1996.jpg', 'The Monument with Snow, Newcastle-on-Tyne, 1996, watercolour'),
  ('greeting-card-st-cuthberts-church-gateshead-on-tyne-1982', '/artwork/cards/st-cuthberts-church-gateshead-on-tyne-1982.jpg', 'St Cuthbert’s Church, Gateshead-on-Tyne, 1982, oil'),
  ('greeting-card-bensham-road-gateshead-1970', '/artwork/cards/bensham-road-gateshead-1970.jpg', 'Bensham Road, Gateshead, 1970, watercolour'),
  ('greeting-card-street-meeting-with-snow-gateshead-1972', '/artwork/cards/street-meeting-with-snow-gateshead-1972.jpg', 'Street meeting with snow, Gateshead, 1972, watercolour'),
  ('greeting-card-cotfield-street-bensham-gateshead', '/artwork/cards/cotfield-street-bensham-gateshead.jpg', 'Cotfield Street, Bensham, Gateshead-on-Tyne, watercolour')
) AS v(slug, path, alt)
JOIN charlie_products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id
);

NOTIFY pgrst, 'reload schema';
