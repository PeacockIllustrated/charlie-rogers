-- Charlie Rogers shop: Brian Rankin's copy changes of 23 October 2026.
-- Mirrors lib/shop/catalogue.ts. Idempotent: safe to re-run.
--
-- 1. Single greeting cards are £2.95 plus postage. Their descriptions said
--    "£2.95 including the envelope", which read as the whole cost.
-- 2. The card pack says single cards are also available.
--
-- The print blind stamp, the gallery details and the gallery page live in the
-- site code, not the database, so nothing here touches them.
--
-- Run 20261012090000 and 20261013090000 first if they have not been run: the
-- single card rows this updates are created by 20261013090000.

UPDATE charlie_products
SET description = replace(description, '£2.95 including the envelope.', '£2.95 plus postage, including the envelope.'),
    updated_at = now()
WHERE product_type = 'other'
  AND slug LIKE 'greeting-card-%'
  AND description LIKE '%£2.95 including the envelope.%';

UPDATE charlie_products
SET description = replace(
      description,
      'Each card is stamped with the official Charlie Rogers logo.' || E'\n\n',
      'Each card is stamped with the official Charlie Rogers logo. Single cards are also available, £2.95 each plus postage.' || E'\n\n'
    ),
    updated_at = now()
WHERE slug = 'greeting-card-collection'
  AND description NOT LIKE '%Single cards are also available%';
