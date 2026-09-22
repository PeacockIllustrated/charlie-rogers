# Places images, re-matched off the page 27 contact sheet

22 September 2026. Every Places entry except the two Brian Rankin photographs
was illustrated from page 27 of the book, the contact-sheet page that keys the
labelled paintings to the map on page 26. Those extracts are about 176x143
pixels. Six of the eight have been re-pointed at a larger reproduction of the
same painting elsewhere in the book. Two have not, because no second
reproduction exists.

## Method

All 316 extracts in `public/paintings/web/` were montaged into eleven contact
sheets and read. Candidates were then compared feature by feature against the
page 27 thumbnail at matched scale. A normalised grayscale correlation over the
whole set was used as a second opinion, not as the decision: on the six
confirmed pairs it scored 0.54 to 0.91 and put the true match first by a wide
margin, so a best score in the low 0.3s is good evidence that no duplicate
exists.

`web/` holds each extract at its native resolution. `thumbs/` is always 400px
wide, which for a 176px native is an upscale carrying no extra detail, so the
web variant is the honest one even where its pixel count is lower.

## Swapped

| Place | Was | Now | Matched on |
| --- | --- | --- | --- |
| Saltwell Park | page_027_img_000, 179x149 | page_039_img_000, 771x517 | Slate-spired corner tower, crenellated parapet, bare tree with green buds, three lit windows of the right wing, figures at the gate, caption line |
| Shipley Art Gallery | page_027_img_003, 180x149 | page_038_img_001, 332x235 | Portico with paired columns, statue on the pier, lettered frieze, red phone box and pillar box, figures at the railings, handwritten caption |
| Gateshead Cenotaph | page_027_img_004, 179x148 | page_036_img_000, 776x522 | Pedimented canopy with soldier in the niche, lamp standard, seated figure in red, walking figure with a black dog, two traffic light posts, spire top right |
| St Cuthbert's Church | page_027_img_005, 176x143 | page_032_img_002, 247x182 | House hung with red creeper, dark conifer, broach spire, gabled transept with cross finial, white gate and railings, figure in blue bottom right |
| Cotfield Street | page_027_img_006, 176x143 | page_031_img_003, 246x205 | Corner shop with green window and disc sign, dark house closing the street, yellow passage wall, two smoking chimneys, signature bottom left |
| Quayside | page_027_img_008, 176x144 | page_076_img_000, 327x242 | Statue group on the pediment, arched gateway with fanlight and blue-shaded gates, run of arched windows, green-domed tower and clock cupola, figures bottom right |

## Left alone

- **239 Westbourne Avenue**, page_027_img_001. The oil of a street with a large
  white hoarding and a figure walking a dog appears once in the book.
- **Coatsworth Road**, page_027_img_002. The wet street with a corner shop at
  left and a lantern tower at right appears once. `page_034_img_001` is a
  different Gateshead street, with a green dome and a hoarding lettered "stamps
  wanted".
- **Railway Quarter** and **Bigg Market** already carry photographs of the
  originals and were not in scope.

## Correction to an earlier note

An earlier pass recorded St Cuthbert's as `page_032_img_001`. That extract is a
different painting of the same church: a closer three-quarter view with a
purple-slate roof, cross finials on the gables and headstones in the
foreground. The painting on page 27 is `page_032_img_002`, the view from the
grass bank. Same church, different work.

## Not verified

- Whether the ten page 27 extracts are keyed to the right places at all. The
  extraction notes say placements come back in reading order and that the
  labels run Saltwell Park, 239 Westbourne Avenue, Coatsworth Road, Shipley Art
  Gallery, Cenotaph, St Cuthbert's Church, Cotfield Street, The Railway
  Quarter, and that mapping is what the entries already assume. It was taken as
  given here, not re-checked, because the source PDF is not in the repository.
  The 239 Westbourne Avenue image in particular shows a commercial street with
  a hoarding rather than a terrace house, which is worth a look when the PDF is
  to hand.
- Titles, dates and media of any of these paintings. The manifest carries no
  caption text.
