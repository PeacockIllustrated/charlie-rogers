-- Charlie Rogers shop: the prints and single cards Brian Rankin set out on
-- 12 October 2026. Mirrors lib/shop/catalogue.ts and lib/shop/prints.ts.
-- Idempotent: safe to re-run.
--
-- 1. The eight paintings already listed that are on his Charlie Rogers
--    Collection info sheet become priced prints: 40.6 x 50.8cm, a standard
--    print at £45 or a limited edition of 50 at £120, delivered free. The row
--    holds the lower price and the site shows "From £45.00". Town Moor is not
--    on the sheet and is left as it is, price on application.
-- 2. Street Meeting, Gateshead, on the sheet but not yet listed, is added,
--    with Brian's photographs of its limited edition. It is not the card
--    design "Street meeting with snow, 1972". An earlier draft of this file
--    listed it under that name with the card picture; if that row exists it
--    is renamed below rather than duplicated.
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

UPDATE charlie_products
SET title = 'Street Meeting, Gateshead',
    slug = 'street-meeting-gateshead',
    medium = 'Oil on canvas',
    year_text = '1969',
    description = 'Shown here as the limited edition: a giclée print in its mount, with the certificate of authenticity that comes with every one of the fifty.',
    updated_at = now()
WHERE slug = 'street-meeting-with-snow-gateshead-1972'
  AND product_type = 'print'
  AND NOT EXISTS (SELECT 1 FROM charlie_products WHERE slug = 'street-meeting-gateshead');

DELETE FROM charlie_product_images i
USING charlie_products p
WHERE i.product_id = p.id
  AND p.slug = 'street-meeting-gateshead'
  AND i.storage_path = '/artwork/cards/street-meeting-with-snow-gateshead-1972.jpg';

INSERT INTO charlie_products
  (title, slug, description, price_pence, product_type, status, medium, dimensions, year_text, edition, stock_count, is_featured)
VALUES
  ('Street Meeting, Gateshead', 'street-meeting-gateshead',
   'Shown here as the limited edition: a giclée print in its mount, with the certificate of authenticity that comes with every one of the fifty.',
   4500, 'print', 'published', 'Oil on canvas', '40.6 x 50.8 cm (16 x 20 in)', '1969', 'Standard print, or limited edition of 50', 0, false),
  ('Greeting card, The Monument with Snow, Newcastle-on-Tyne', 'greeting-card-the-monument-with-snow-newcastle-on-tyne-1996',
   'A single greeting card of The Monument with Snow, Newcastle-on-Tyne 1996, from the greeting card collection. £2.95 including the envelope. The card is stamped with the official Charlie Rogers logo.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, St Cuthbert’s Church, Gateshead-on-Tyne', 'greeting-card-st-cuthberts-church-gateshead-on-tyne-1982',
   'A single greeting card of St Cuthbert’s Church, Gateshead-on-Tyne 1982, from the greeting card collection. £2.95 including the envelope. The card is stamped with the official Charlie Rogers logo.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Bensham Road, Gateshead', 'greeting-card-bensham-road-gateshead-1970',
   'A single greeting card of Bensham Road, Gateshead 1970, from the greeting card collection. £2.95 including the envelope. The card is stamped with the official Charlie Rogers logo.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Street meeting with snow, Gateshead', 'greeting-card-street-meeting-with-snow-gateshead-1972',
   'A single greeting card of Street meeting with snow, Gateshead 1972, from the greeting card collection. £2.95 including the envelope. The card is stamped with the official Charlie Rogers logo.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false),
  ('Greeting card, Cotfield Street, Bensham, Gateshead-on-Tyne', 'greeting-card-cotfield-street-bensham-gateshead',
   'A single greeting card of Cotfield Street, Bensham, Gateshead-on-Tyne, from the greeting card collection. £2.95 including the envelope. The card is stamped with the official Charlie Rogers logo.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.',
   295, 'other', 'published', NULL, 'A6, 105 x 148mm', NULL, NULL, 100, false)
ON CONFLICT (slug) DO NOTHING;

-- One picture each, only where the product has none, so a picture replaced
-- in the admin is left alone.
INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, v.path, v.alt, 0, true
FROM (VALUES
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

-- Several pictures each, all or none: only where the product has no picture
-- yet. Street Meeting's limited edition, and Brian's photographs of the book
-- and its Christmas 2026 display, 13 October 2026.
INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, v.path, v.alt, v.ord, v.ord = 0
FROM (VALUES
  ('street-meeting-gateshead', 0, '/artwork/shop/street-meeting-gateshead-limited-edition-mounted.jpg', 'The limited edition print of Street Meeting, Gateshead in its white mount, with the Charlie Rogers Collection label on the wine red corner.'),
  ('street-meeting-gateshead', 1, '/artwork/shop/street-meeting-gateshead-limited-edition-easel.jpg', 'The mounted limited edition print of Street Meeting, Gateshead standing on an easel in a garden.'),
  ('street-meeting-gateshead', 2, '/artwork/shop/street-meeting-gateshead-certificate.jpg', 'The certificate of authenticity for the limited edition giclée print of Street Meeting, Gateshead, with space for the edition number.'),
  ('pursued-by-bulldozers-special-edition', 0, '/artwork/book/pursued-by-bulldozers.jpg', 'The hardback of Charlie Rogers, Pursued by Bulldozers, standing open on a stone table, the snowy back lane of its cover facing out.'),
  ('pursued-by-bulldozers-special-edition', 1, '/artwork/book/pursued-by-bulldozers-standing.jpg', 'The book standing on a table in a gallery, framed drawings by Charlie Rogers on the wall behind.'),
  ('pursued-by-bulldozers-special-edition', 2, '/artwork/book/pursued-by-bulldozers-studio-table.jpg', 'The book on a table laid as Charlie''s studio: a framed drawing, a wireless, brushes in a jar, a teacup and a bronze dog.'),
  ('pursued-by-bulldozers-special-edition', 3, '/artwork/book/christmas-2026-display.jpg', 'The Christmas 2026 display box of the limited edition, labelled perfect Christmas gift, in a gallery hung with Charlie''s paintings.'),
  ('pursued-by-bulldozers-special-edition', 4, '/artwork/book/christmas-2026-display-gallery.jpg', 'The Christmas 2026 display box in front of a large photograph of Charlie Rogers.')
) AS v(slug, ord, path, alt)
JOIN charlie_products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id
);

-- Brian Rankin, 13 October 2026: every card is stamped with the official
-- Charlie Rogers logo. Appended to the pack's description once.
UPDATE charlie_products
SET description = replace(
      description,
      'Cotfield Street, Bensham, Gateshead-on-Tyne.',
      'Cotfield Street, Bensham, Gateshead-on-Tyne. Each card is stamped with the official Charlie Rogers logo.'),
    updated_at = now()
WHERE slug = 'greeting-card-collection'
  AND description NOT LIKE '%stamped with the official Charlie Rogers logo%';

NOTIFY pgrst, 'reload schema';
