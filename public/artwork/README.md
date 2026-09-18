# Artwork from Brian Rankin

The nine paintings Brian Rankin put forward for print, identified by eye against
the images in the `Charlie Rodgers` mail folder and named by slug. Provenance
for each, including the source email and Brian's own copy, is in
`docs/artwork-inbox/manifest.json`.

These replace nothing. `public/paintings/` still holds the 316 images extracted
from the low resolution book PDF at around 108 ppi.

## Print viability, measured

Two of these are fit to sell as prints. The rest were downscaled to 1920px or
smaller somewhere between Brian's phone and the download, so they are web
assets, not print masters.

| Painting | Pixels | At 300dpi | Fit for |
| --- | --- | --- | --- |
| Town Moor, Newcastle-upon-Tyne, 1966 | 7191 x 5393 | 61cm long edge | Print |
| Bigg Market, Newcastle-on-Tyne, 1975 | 3597 x 2591 | 30cm long edge | Print |
| The Joke Shop, Gateshead-on-Tyne, 1966 | 2048 x 1386 | 17cm | Web, small print at a push |
| Pot Pie Bob's, Wellington Street, 1977 | 1920 x 1838 | 16cm | Web |
| Four Doors at School Street, 1977 | 1920 x 1459 | 16cm | Web |
| The Men on the Seats, 1973 | 1920 x 1440 | 16cm | Web |
| Bensham Road, Gateshead, 1970 | 1920 x 1288 | 16cm | Web |
| Third Street, Back Lane, Bensham, 1980 | 640 x 449 | 5cm | Web thumbnail only |

Third Street is the book cover painting and the weakest file of the set, because
the only copy in the mailbox was a small inline reproduction attached under the
misleading name `Paul Wright.jpg`.

This confirms what CLAUDE.md already says: print commerce needs original high
resolution scans from Brian Rankin or Charlie Rogers Junior. Town Moor is the
single exception and could be sold today.

## Two corrections to Brian's copy

- **Bensham Road, 1970** is catalogued by Brian as "Oil on paper" in his print
  email. The image is plainly watercolour and ink, and his own greeting card
  caption for the same painting says watercolour. The card caption is right.
- **Pop, 1967** is not in this folder. It was confirmed from the file Tom sent
  directly: an interior with a man in a flat cap reading a newspaper, a bottle
  of Newcastle Brown Ale, a brown teapot and a jar of Gale's pickled onions on a
  striped cloth, signed GHRogers 1967.

## Layout

- `public/artwork/` holds the print masters, including the original HEIC for
  Bigg Market. These are never served to a browser.
- `public/artwork/web/` holds the derivatives the site actually serves, capped
  at 1600px on the long edge. The masters total 27MB, which would be the weight
  of the shop listing page on its own; the derivatives bring it to 3MB.

Regenerate the derivatives after replacing any master. The HEIC was converted
with pillow-heif at quality 92.

## Still missing

- **Pop, 1967** has no file here. Tom holds it locally; it was not in the folder
  supplied for matching, so the product renders without an image.
- The special edition book and the greeting card collection have no product
  photography. Brian sent a photograph of the embossed and signed title page
  (`IMG_4874.jpeg`) and a five page PDF of the card designs, both of which are
  catalogued in the manifest but were not among the downloaded files.
