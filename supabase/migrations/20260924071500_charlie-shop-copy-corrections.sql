-- Bring the live product rows up to the 24 September 2026 reconciliation.
--
-- supabase/seed-shop.sql carries the corrected copy, but it ends in
-- ON CONFLICT (slug) DO NOTHING and was already applied to this instance on
-- 18 September. Re-running it therefore changes nothing, and the configured
-- shop reads these rows rather than lib/shop/catalogue.ts, so without this
-- migration the public pages keep showing wording Brian Rankin did not write:
-- a cafe "known locally as Pot Pie Bob's", a Bigg Market bargain "in the Bigg
-- Market", Bensham Road as "Watercolour and ink", and three paragraphs of his
-- that never appeared at all. What changed and why is set out in
-- docs/artwork-inbox/brian-spec-audit.md.
--
-- Every statement is guarded on the value it is replacing. A row edited in the
-- admin since the seed no longer matches and is left exactly as it is, so this
-- cannot overwrite anyone's work, and it can be run twice with no effect the
-- second time. That is the whole reason it is written as seven narrow updates
-- rather than an upsert over the seed.

UPDATE charlie_products
SET description = 'Pursued by Bulldozers is the story of a self-taught artist for whom the streets, back lanes and everyday scenes of life in Gateshead and Newcastle were the inspiration for a little-known collection of sketches and paintings that are receiving widespread local and regional acclaim, both from the public and the artistic community. As the name implies, Charlie’s work captured edifices, landmarks, images and personalities just before they were lost forever to modernisation in the rapidly changing urban communities of the late 20th century North East.

This special edition is exclusive to this website. To celebrate the launch of the new website, a limited edition of just 100 copies is being made available. Each copy will be embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin.

It is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed.',
    updated_at = now()
WHERE slug = 'pursued-by-bulldozers-special-edition'
  AND description = 'To celebrate the launch of the new website, a limited edition of just 100 copies is being made available. Each copy will be embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin.

It is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed.';

UPDATE charlie_products
SET description = 'Charlie Rogers was a master at capturing scenes of northern folk going about their daily chores.

This typical scene features a variety of characters looking to pick up a bargain or two on market day.',
    updated_at = now()
WHERE slug = 'bigg-market-newcastle-on-tyne-1975'
  AND description = 'Charlie Rogers was a master at capturing scenes of northern folk going about their daily chores.

This typical scene features a variety of characters looking to pick up a bargain in the Bigg Market.';

UPDATE charlie_products
SET description = 'This vibrant oil painting features a row of four doors which could be found in any northern town during the second half of the twentieth century.

The open door appears to invite the viewer in, leaving the viewer with a sense of curiosity.',
    updated_at = now()
WHERE slug = 'four-doors-at-school-street-gateshead-1977'
  AND description = 'This vibrant oil painting features a row of four doors which could be found in any northern town during the second half of the twentieth century.';

UPDATE charlie_products
SET description = 'Charlie Rogers painted many cafe scenes during his many visits to Paris. However occasionally he was inspired to paint a cafe closer to home.

Charlie was a regular visitor to this cafe located near the High Level Bridge.',
    updated_at = now()
WHERE slug = 'pot-pie-bobs-wellington-street-gateshead-1977'
  AND description = 'Charlie Rogers painted many cafe scenes during his many visits to Paris. However occasionally he was inspired to paint a cafe closer to home.

Charlie was a regular visitor to the High Level Cafe on Wellington Street, known locally as Pot Pie Bob’s.';

UPDATE charlie_products
SET description = 'Charlie Rogers included a bottle of Brown Ale in many of his interior and bar paintings, particularly when his father, Pop, features in the same painting. It seems this was Pop’s drink of choice.

This exceptional domestic scene features a rare glimpse inside the living room of the Rogers family home during their residency at Westbourne Avenue, near Saltwell Park.

This watercolour painting is generally regarded by supporters and academics as Charlie’s finest interior painting.',
    updated_at = now()
WHERE slug = 'pop-1967'
  AND description = 'Charlie Rogers included a bottle of Brown Ale in many of his interior and bar paintings, particularly when his father, Pop, features in the same painting. It seems this was Pop’s drink of choice.';

UPDATE charlie_products
SET medium = 'Watercolour',
    updated_at = now()
WHERE slug = 'bensham-road-gateshead-1970'
  AND medium = 'Watercolour and ink';

UPDATE charlie_products
SET dimensions = 'A6, 105 x 148mm',
    updated_at = now()
WHERE slug = 'greeting-card-collection'
  AND dimensions IS NULL;
