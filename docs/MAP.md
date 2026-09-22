# The Places map

The Places page plots the Tyneside places Charlie painted, so the argument the
page makes is visible rather than asserted: he worked a few square miles, and
most of what he painted in them is gone.

Built on Leaflet. Loaded inside an effect, so it stays out of the first load
bundle and the page costs nothing extra to anyone who never reaches it.

## What is on it

- Gateshead and Newcastle places only. Paris and Spennymoor are listed on the
  page but not plotted, because a frame wide enough to hold Paris is not a map
  of anywhere.
- A solid marker is the site itself. A hollow marker is a street or an area.
- Colours follow the existing status coding: bensham for demolished, ochre for
  altered, sage for extant.
- Every marker is also an ordinary button under the map, so the pins work for
  keyboard and screen reader users. The map is a view of the list, never the
  only route to a place.
- If Leaflet fails to load, the page falls back to the region lists that were
  always there.

## The coordinates are not verified

**Read this before anyone treats the map as a record.**

Every position in `lib/content/places.ts` is a working estimate written from
general knowledge of Tyneside. None has been checked against a gazetteer, a
survey or an Ordnance Survey sheet. The build environment has no outbound
network access to any geocoding service, so nothing could be confirmed at the
time of writing.

The data model records this rather than hiding it. Each `coords` entry carries
a `precision` of `site`, `street` or `district`, and a `basis` string saying
where the position came from. The map renders `site` as a solid marker and the
other two as hollow ones, so it does not make a claim the data cannot support.

| Place | Precision | Needs |
| --- | --- | --- |
| Saltwell Park | district | Fine as a park centre. Consider pinning Saltwell Towers instead, since that is the building in the text and the proposed exhibition site. |
| 239 Westbourne Avenue | street | The house number. This is Charlie's birthplace and deserves an exact pin. |
| Coatsworth Road | street | Fine as a street midpoint. |
| Shipley Art Gallery | site | Confirm against the listed building record. |
| Gateshead Cenotaph | site | Confirm. |
| St Cuthbert's Church, Bensham | street | The demolished footprint. Pinned on Bensham Road as a stand in. |
| Cotfield Street | street | Pinned near 262 Bensham Road, the house Charlie painted from. The street itself is gone. |
| Railway Quarter (Gateshead East) | district | An area, not an address. Probably correct to leave as a district. |
| Quayside | district | An area. Fine. |
| Bigg Market | site | Confirm, and consider pinning the Univision Gallery site if it can be established. |
| Spennymoor | district | Not plotted. Held in the data for completeness. |

Brian Rankin or Charlie Rogers Junior can likely settle the Bensham ones from
memory faster than any archive. The two worth the most are Westbourne Avenue,
because it is the birthplace, and St Cuthbert's, because a demolished church
with a known footprint is exactly the kind of thing this site exists to record.

## The historic overlay

### Why there is no tile URL in the code

The archival maps everyone means are the National Library of Scotland's
georeferenced Ordnance Survey scans. Since March 2022 NLS serves them only
through MapTiler Cloud. The terms:

- Free tier: non-commercial use, up to 100,000 tile requests per month.
- Commercial use, or more than 100,000 requests a month: a paid MapTiler plan
  (FLEX or UNLIMITED), and NLS additionally ask to confirm commercial use of
  the tiles directly, at geo@nls.uk.

This site sells a book, so it is a commercial site. Hotlinking the tiles
without that arrangement is not a detail to tidy up after launch. It is the
kind of thing that earns a heritage project a letter from the institution it
most wants on its side.

So no historic tile URL is hardcoded. The layer is read from the environment,
and the toggle only appears once it is configured. Until then the map shows the
modern base layer and nothing is broken.

### Turning it on

1. Settle the licensing: a MapTiler account, a commercial plan if the free tier
   does not cover you, and confirmation from geo@nls.uk.
2. Pick a layer. For Tyneside in Charlie's period the useful ones are the OS
   six-inch and 25-inch County Series, surveyed from the 1890s and revised into
   the 1950s, which show the back lanes and terraces before the clearances.
3. Put the URL MapTiler gives you into the environment:

```
NEXT_PUBLIC_HISTORIC_TILE_URL=https://api.maptiler.com/tiles/<layer>/{z}/{x}/{y}.jpg?key=<key>
NEXT_PUBLIC_HISTORIC_TILE_ATTRIBUTION=Historic maps &copy; National Library of Scotland
NEXT_PUBLIC_HISTORIC_TILE_LABEL=Ordnance Survey, 1890s
NEXT_PUBLIC_HISTORIC_TILE_MAX_ZOOM=17
```

Set `NEXT_PUBLIC_HISTORIC_TILE_MAX_ZOOM` to whatever the layer actually
provides. Asking a tile server for a zoom level it never generated returns
blank tiles rather than an error, which on screen looks like a broken map.

These are `NEXT_PUBLIC_` variables, so they are compiled into the browser
bundle and are readable by anyone who views source. That is unavoidable for a
client side map and is why the MapTiler key should be restricted to the site's
own domains in the MapTiler dashboard.

### Verified behaviour

The toggle was tested end to end against a local tile server standing in for
NLS, because the build environment cannot reach the real one:

- With no environment set, the toggle does not render and the map shows only
  the base layer.
- With it set, the toggle appears, adds a second tile layer at 0.7 opacity, and
  the fade slider drives that layer's opacity down to 0.3 and back.
- Unchecking removes the layer and the slider.

What could not be tested here is the real NLS tiles: their alignment over
modern Tyneside, their true maximum zoom, and how legible they are under the
markers. Check all three on a preview deployment before showing anyone.

## The base map

Defaults to OpenStreetMap's own tiles, which need no key. Their tile usage
policy asks heavy or commercial consumers to move to a provider rather than
lean on donated capacity. If this map gets real traffic, point
`NEXT_PUBLIC_BASE_TILE_URL` and `NEXT_PUBLIC_BASE_TILE_ATTRIBUTION` at the same
MapTiler account the historic layer already uses, and keep one bill instead of
two.

## Still to do

- Confirm the coordinates, starting with the table above.
- The historical and modern comparison slider in `docs/FUTURE-FEATURES.md` is a
  different thing from this toggle, and now has somewhere to live.
