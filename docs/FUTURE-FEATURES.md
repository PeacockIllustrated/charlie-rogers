# Future features and considered ideas

Ideas with merit that are not part of the immediate build. Some are committed roadmap items waiting for their phase, some are noted-and-deferred. Each has a verdict and notes.

## Comparison-slider map

**Verdict: committed, scheduled for Phase 4 of the roadmap.**

This is the headline interactive feature. The concept: a Mapbox GL map of Gateshead and Newcastle with a draggable vertical slider revealing two base layers side by side. On one side, the modern OpenStreetMap or Mapbox Standard base. On the other, a 1950s or 1960s Ordnance Survey raster tile set, showing the Tyneside that existed when Charlie was painting.

### Why this is the right feature for the project

The book is geographically organised. Half the buildings Charlie painted no longer exist. Sliding between the two basemaps literally enacts the bulldozers thesis: the user drags, and the buildings disappear.

The page 26 numbered map in the book is the print-version of this exact idea. The site's version makes it interactive.

### Technical approach

- Mapbox GL JS for the base map. Custom style matching the site palette (paper background, slate-blue water, ochre primary roads, hairline minor roads, no labels except district names, Bensham red for our markers).
- `mapbox-gl-compare` plugin for the slider mechanic.
- Historical base tiles from the **National Library of Scotland**. They serve georeferenced historical OS maps of all of Britain under a permissive licence (CC-BY) and provide them as raster tiles ready to plug into Leaflet or Mapbox. URL pattern: `https://mapseries-tilesets.s3.amazonaws.com/...`. Confirm the licence and the recommended attribution at https://maps.nls.uk/projects/api/. The 1:25,000 or 1:10,560 OS series from the 1950s-60s is the right resolution for Tyneside at the painting scale.
- Markers come from the `locations` table. Lat-lng identical on both base maps so positions stay in sync as the user slides.
- Marker click opens a slide-in panel showing the paintings of that location (filtered from `paintings.location_id`), the modern photo where one exists, the status, and the editorial copy.

### Marker colour coding

- Extant: sage
- Altered: ochre
- Demolished: Bensham red

The map at a glance should show the scale of loss.

### Filter controls

- Toggle: show only demolished
- Toggle: show only extant
- Filter by district (Bensham, Saltwell, Quayside, etc.)
- Filter by painting motif (snow scenes, pubs, churches)

### Performance considerations

NLS tiles are external, rate-limited, and not blazingly fast. Pre-cache the bounding box of Gateshead and Newcastle to a CDN bucket if performance becomes a problem at scale. Confirm with NLS that pre-caching is permitted under their licence terms (they generally encourage it for heavy users).

## 3D rendered map

**Verdict: deferred. Considered, judged a poor fit for the content.**

3D map rendering itself is straightforward: Mapbox Standard with `show-3d-buildings: true`, CesiumJS, or Google Photorealistic 3D Tiles all render Gateshead in 3D out of the box. The technical lift is small.

The content problem is large. Approximately half of the buildings Charlie painted no longer exist. A 3D map renders what exists today, which means modern Vistry Group housing stands where Charlie's terraces used to stand. The thing the book is about (what was lost) is precisely the thing a default 3D map cannot show.

Three options if 3D ever becomes worth pursuing:

1. **Accept the contrast.** Show 3D for today, paintings for then, let the gap be the story. Cheapest, arguably most honest.
2. **Model the lost buildings.** Either hand-built in SketchUp from Trevor Ermel's photographs and Charlie's paintings, or AI-assisted from the same sources. Effort scales with the number of lost buildings, which is in the hundreds.
3. **Ghost overlays.** Render lost buildings as wireframe or translucent volumes against the modern 3D base. Visually striking, technically doable in Cesium with custom 3D tiles, but you still have to model the buildings first.

The 2D comparison slider does the same emotional work with a fraction of the effort. Revisit 3D only if a specific use case demands it (e.g. a virtual Saltwell Park trail experience for partners).

## Interactive 3D book widget

**Verdict: deferred. Off-theme for this project.**

The idea: a 3D page-flipping book widget on the site, with anchor links from the editorial copy that turn to the relevant page.

This was discussed and self-critiqued as too flashy for a project about quiet observation and loss. A Pursued-by-Bulldozers website should not feel like an Apple keynote. The book itself is for sale; people who want to read it can buy it.

The underlying instinct (deep linking from text to source pages) is sound and worth retaining for a future project where the tone allows it.

## Saltwell Park audio trail

**Verdict: deferred, partner-dependent.**

A self-guided audio trail through Saltwell Park, sequencing the locations where Charlie painted and offering narrated commentary. Could be delivered as a progressive web app to avoid the friction of native app stores.

Depends on Brian Rankin's conversations with Gateshead Council and on whether voice talent is available (Michael Chaplin, who wrote the foreword, would be the ideal narrator if he can be persuaded).

## Charlie's sketchbooks

**Verdict: deferred, content-dependent.**

The book ends with a stated next research phase: cataloguing the contents of Charlie's surviving sketchbooks. When that catalogue exists, it will be a meaningful content surface: sketches paired with the finished paintings they preceded, showing Charlie's working method.

Build this only when the source material is supplied and digitised.

## Trevor Ermel photograph archive

**Verdict: deferred, rights-dependent.**

Trevor Ermel's photographs of demolition-era Tyneside are placed throughout the book alongside Charlie's paintings of the same scenes. A formalised photograph archive on the site, paired location-by-location with the paintings, would be a significant content addition.

Requires explicit licensing from Trevor Ermel (or his estate). Confirm before building.

## Newsletter and updates

**Verdict: minor, build when first useful.**

A small newsletter signup for major exhibition or product announcements, sent through Resend or Mailchimp. Single field, no frequency promises, no marketing automation.

Build when there is something to announce.

## Community contributions

**Verdict: not on the roadmap.**

Charlie's audience includes people who lived on the streets he painted. Some of them have stories about specific buildings, families, shopkeepers. A community contributions feature where visitors can submit memories tied to a location or painting is appealing in principle and a moderation nightmare in practice.

If this happens, it happens later, with clear moderation tooling and a clear editorial policy. For Phase 1 to 4, do not entertain it.
