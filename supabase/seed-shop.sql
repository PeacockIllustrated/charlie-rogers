-- Charlie Rogers shop, seed data.
--
-- Mirrors lib/shop/catalogue.ts, which the site falls back to when Supabase is
-- not configured. Applied to the shared instance on 18 September 2026.
-- Idempotent: safe to re-run.
--
-- Image paths point at files under public/artwork/web/ rather than the
-- charlie-shop-images bucket. Those files live in the repository and are served
-- by the app, and lib/shop/utils.ts returns any path beginning with a slash
-- unchanged. Anything uploaded through the admin goes to the bucket as normal.
-- Worth revisiting once Brian Rankin supplies high resolution originals.
--
-- Prices are Brian's. Only the book and the greeting cards are priced; every
-- painting is 0, which the site renders as price on application.

INSERT INTO charlie_products
  (title, slug, description, price_pence, product_type, status, medium, dimensions, year_text, edition, is_featured)
VALUES
  ('Pursued by Bulldozers, special edition', 'pursued-by-bulldozers-special-edition', 'To celebrate the launch of the new website, a limited edition of just 100 copies is being made available. Each copy will be embossed with the bespoke Charlie Rogers logo and signed personally by author Brian Rankin.

It is anticipated that the monetary value of each copy will increase over time, although this is not guaranteed.', 2500, 'book', 'published', NULL, NULL, NULL, 'Limited to 100 copies', true),
  ('Town Moor, Newcastle-upon-Tyne', 'town-moor-newcastle-upon-tyne-1966', 'Rogers was the Cezanne of Tyneside, painting the street scenes all around him. Some of his paintings were very gloomy as he was painting the decline of industries and recording social change. Others were more uplifting, the Hoppings at the Town Moor.

In this painting Charlie has captured a typical day at the Hoppings, Europe''s largest travelling funfair held annually at Newcastle Town Moor.', 0, 'print', 'published', 'Watercolour', NULL, '1966', NULL, true),
  ('Bigg Market, Newcastle-on-Tyne', 'bigg-market-newcastle-on-tyne-1975', 'Charlie Rogers was a master at capturing scenes of northern folk going about their daily chores.

This typical scene features a variety of characters looking to pick up a bargain in the Bigg Market.', 0, 'print', 'published', 'Watercolour', NULL, '1975', NULL, false),
  ('The Joke Shop, Gateshead-on-Tyne', 'the-joke-shop-gateshead-on-tyne-1966', 'Your Charlie Rogers Collection will not be complete without a scene of the Railway Quarter.

The Railway Quarter is situated close to both the High Level and Tyne Bridge. It once boasted two railway stations, Gateshead East and Gateshead West. The area provided a wealth of painting opportunities, including some of the region’s most iconic public houses, and of course the never-to-be-forgotten Joke Shop.

Charlie could always paint here, even in poor weather conditions, as shelter was provided by a large railway arch which features in many of his paintings.', 0, 'print', 'published', 'Watercolour and pen', NULL, '1966', NULL, false),
  ('The Men on the Seats', 'the-men-on-the-seats-1973', 'This scene created in oil would have captured Charlie’s compulsion to record scenes of human interaction. It is highly probable the location was the sheltered seating area opposite the bandstand at Saltwell Park in Gateshead. Charlie visited the park regularly.

Most of his early artwork were in oils before he was forced to stop and turn to painting with watercolours due to health concerns.', 0, 'print', 'published', 'Oil', NULL, '1973', NULL, false),
  ('Third Street, Back Lane, Bensham, Gateshead', 'third-street-back-lane-bensham-gateshead-1980', 'Charlie Rogers has been described as an “artist of the drunken lamp post and master of the back streets.”

This classic painting is widely regarded as Charlie’s finest snow scene and therefore a must for any collector. It was chosen as the cover of the book Pursued by Bulldozers.', 0, 'print', 'published', 'Oil on paper', NULL, '1980', NULL, false),
  ('Four Doors at School Street, Gateshead', 'four-doors-at-school-street-gateshead-1977', 'This vibrant oil painting features a row of four doors which could be found in any northern town during the second half of the twentieth century.', 0, 'print', 'published', 'Oil on board', NULL, '1977', NULL, false),
  ('Bensham Road, Gateshead', 'bensham-road-gateshead-1970', 'Charlie Rogers possessed a strong compulsion to record the people around him. This delightful snow scene tells the story of struggle.', 0, 'print', 'published', 'Watercolour and ink', NULL, '1970', NULL, false),
  ('Pot Pie Bob’s, Wellington Street, Gateshead', 'pot-pie-bobs-wellington-street-gateshead-1977', 'Charlie Rogers painted many cafe scenes during his many visits to Paris. However occasionally he was inspired to paint a cafe closer to home.

Charlie was a regular visitor to the High Level Cafe on Wellington Street, known locally as Pot Pie Bob’s.', 0, 'print', 'published', 'Watercolour', 'Original painting 22 x 21cm, mounted print 30 x 25cm', '1977', NULL, false),
  ('Pop', 'pop-1967', 'Charlie Rogers included a bottle of Brown Ale in many of his interior and bar paintings, particularly when his father, Pop, features in the same painting. It seems this was Pop’s drink of choice.', 0, 'print', 'published', 'Watercolour', NULL, '1967', NULL, false),
  ('Greeting card collection', 'greeting-card-collection', 'A pack of five cards reproducing Charlie Rogers paintings and sketches: The Monument with Snow, Newcastle-on-Tyne 1996; St Cuthbert’s Church, Gateshead-on-Tyne 1982; Bensham Road, Gateshead 1970; Street meeting with snow, Gateshead 1972; and Cotfield Street, Bensham, Gateshead-on-Tyne.

All Charlie Rogers paintings and sketches © Charles Rogers Junior.', 1000, 'other', 'published', NULL, NULL, NULL, NULL, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO charlie_product_images (product_id, storage_path, alt_text, display_order, is_primary)
SELECT p.id, v.path, v.alt, 0, true
FROM (VALUES
  ('town-moor-newcastle-upon-tyne-1966', '/artwork/web/town-moor-newcastle-upon-tyne-1966.jpg', 'Watercolour of the Hoppings funfair on Newcastle Town Moor, 1966'),
  ('bigg-market-newcastle-on-tyne-1975', '/artwork/web/bigg-market-newcastle-on-tyne-1975.jpg', 'Watercolour of the Bigg Market, Newcastle-on-Tyne, 1975'),
  ('the-joke-shop-gateshead-on-tyne-1966', '/artwork/web/the-joke-shop-gateshead-on-tyne-1966.jpg', 'Watercolour and pen view of the Joke Shop in the Railway Quarter, Gateshead, 1966'),
  ('the-men-on-the-seats-1973', '/artwork/web/the-men-on-the-seats-1973.jpg', 'Oil painting of eight men seated along a park bench with a black dog, 1973'),
  ('third-street-back-lane-bensham-gateshead-1980', '/artwork/web/third-street-back-lane-bensham-gateshead-1980.jpg', 'Snow-covered back lane between brick terraces with a church spire beyond, Bensham, Gateshead, 1980'),
  ('four-doors-at-school-street-gateshead-1977', '/artwork/web/four-doors-at-school-street-gateshead-1977.jpg', 'Oil painting of four adjoining front doors in a brick terrace, School Street, Gateshead, 1977'),
  ('bensham-road-gateshead-1970', '/artwork/web/bensham-road-gateshead-1970.jpg', 'Snow scene on Bensham Road, Gateshead, with a woman pushing a pram uphill past shopfronts, 1970'),
  ('pot-pie-bobs-wellington-street-gateshead-1977', '/artwork/web/pot-pie-bobs-wellington-street-gateshead-1977.jpg', 'Watercolour of the High Level Cafe shopfront set in a stone railway arch, Wellington Street, Gateshead, 1977')
) AS v(slug, path, alt)
JOIN charlie_products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM charlie_product_images i WHERE i.product_id = p.id
);
