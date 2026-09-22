'use client'

import 'leaflet/dist/leaflet.css'
// Must come after Leaflet's own stylesheet. See the note in places-map.css.
import './places-map.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker, TileLayer } from 'leaflet'
import { baseLayer, historicLayer } from '@/lib/map/tiles'
import type { Place, Status } from '@/lib/content/types'

// Leaflet touches window on import, so it is pulled in inside an effect rather
// than at module scope. That also keeps roughly 150KB out of the bundle for
// everyone who never scrolls the map into view.

type Props = {
  places: Place[]
}

// Written as literal class names so Tailwind's scanner finds them: these end up
// inside Leaflet's own DOM through divIcon, which the scanner never sees.
const fill: Record<Status, string> = {
  demolished: 'bg-bensham',
  altered: 'bg-ochre',
  extant: 'bg-sage',
  unknown: 'bg-ink-mute',
}

const outline: Record<Status, string> = {
  demolished: 'border-bensham',
  altered: 'border-ochre',
  extant: 'border-sage',
  unknown: 'border-ink-mute',
}

const statusWord: Record<Status, string> = {
  demolished: 'Demolished',
  altered: 'Altered',
  extant: 'Still standing',
  unknown: 'Status unknown',
}

// Marker content is handed to Leaflet as an HTML string, so anything
// interpolated into it has to be escaped. The place data is ours and static,
// but a name like "St Cuthbert's Church" is one apostrophe away from proving
// why you do this by default rather than when it bites.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Each marker is a paper chip with the status square inside it, rather than a
// bare coloured square. The chip is what makes it legible: a 12px square of
// sage sitting directly on map detail disappears into it, while the same square
// on a paper ground reads at a glance and repeats the swatch language the
// legend and the status labels already use.
//
// A filled square is a position we can stand behind. A hollow one is a street
// or an area, not an address. Half of these buildings came down before anyone
// recorded where exactly they stood, and the map should not pretend otherwise.
function markerHtml(place: Place, selected: boolean): string {
  const exact = place.coords?.precision === 'site'
  const size = selected ? 'h-4 w-4' : 'h-3 w-3'
  const inner = exact
    ? fill[place.status]
    : `bg-paper border-2 ${outline[place.status]}`
  const chip = selected ? 'border-ink' : 'border-rule'
  return `<span class="block border bg-paper p-[3px] ${chip}"><span class="block ${size} ${inner}"></span></span>`
}

// Popup markup. Kept to the artwork, three lines of context and one link, so it
// sits over the map without covering the places around it.
function popupHtml(place: Place): string {
  const name = escapeHtml(place.name)
  const image = place.image
    ? `<img src="${escapeHtml(place.image)}" alt="${name}" width="224" height="168" class="block w-full h-auto" />`
    : ''
  const district = place.district
    ? `<p class="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">${escapeHtml(place.district)}</p>`
    : ''
  const approximate =
    place.coords && place.coords.precision !== 'site'
      ? `<p class="mt-1 font-sans text-xs text-ink-mute">Approximate position, ${escapeHtml(place.coords.precision)} level</p>`
      : ''
  // Width is set by the popup's own minWidth/maxWidth, not here. A fixed width
  // on this div plus the wrapper's padding overflowed the popup by the padding
  // and pushed the artwork past the right border.
  return `
    <div class="w-full">
      ${image}
      <h3 class="mt-3 font-serif text-h4 leading-tight text-ink">${name}</h3>
      ${district}
      <p class="mt-2 font-sans text-xs uppercase tracking-eyebrow ${place.status === 'demolished' ? 'text-bensham' : 'text-ink-soft'}">${statusWord[place.status]}</p>
      ${approximate}
      <a href="/places/${escapeHtml(place.slug)}" class="mt-3 block border border-ink-soft px-3 py-2 text-center font-sans text-small text-ink no-underline hover:bg-ink hover:text-paper">View this place</a>
    </div>
  `
}

export function PlacesMap({ places }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Record<string, Marker>>({})
  const historicRef = useRef<TileLayer | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)

  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [showHistoric, setShowHistoric] = useState(false)
  const [historicOpacity, setHistoricOpacity] = useState(0.7)

  const plotted = useMemo(
    () => places.filter((p) => p.coords && p.region !== 'beyond'),
    [places],
  )

  // Build the map once. plotted is derived from a module-level constant, so it
  // does not change across the life of the page.
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    // The map sits below the fold on /places, and a dynamic import only defers
    // the bundle: the effect still built the map and requested a screenful of
    // tiles on mount, for everyone, including readers who never scrolled to it.
    // docs/MAP.md claimed the page cost nothing extra to anyone who never
    // reached the map, which was simply not true as written. Initialising on
    // approach makes the claim true and stops needless tile requests.
    const buildMap = () => {
      if (cancelled || !containerRef.current) return
      import('leaflet')
        .then(({ default: L }) => {
        if (cancelled || !containerRef.current) return
        leafletRef.current = L

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false, // a map that eats the page scroll is a trap
          zoomControl: true,
          attributionControl: true,
        })
        mapRef.current = map

        // className lets places-map.css tone this layer back without touching
        // the historic overlay, which is already close to monochrome and would
        // only be muddied by the same treatment.
        L.tileLayer(baseLayer.url, {
          attribution: baseLayer.attribution,
          minZoom: baseLayer.minZoom,
          maxZoom: baseLayer.maxZoom,
          className: 'map-base-tiles',
          // Set here rather than in CSS: Leaflet writes opacity inline on the
          // layer element, so a stylesheet rule is overridden and silently
          // does nothing. Letting the paper ground show through is half of
          // what quietens the map.
          opacity: 0.75,
        }).addTo(map)

        for (const place of plotted) {
          if (!place.coords) continue
          const marker = L.marker([place.coords.lat, place.coords.lng], {
            icon: L.divIcon({
              className: 'charlie-marker',
              html: markerHtml(place, false),
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
            keyboard: true,
            title: place.name,
            alt: `${place.name}, ${place.status}`,
          })
          // autoPan keeps a popup near the edge from opening half off screen,
          // and the padding stops it from tucking under the attribution strip.
          marker.bindPopup(popupHtml(place), {
            className: 'charlie-popup',
            minWidth: 248,
            maxWidth: 248,
            offset: [0, -6],
            autoPanPadding: [24, 24],
            closeButton: true,
          })
          marker.on('popupopen', () => setSelected(place.slug))
          marker.on('popupclose', () =>
            setSelected((current) => (current === place.slug ? null : current)),
          )
          marker.addTo(map)
          markersRef.current[place.slug] = marker
        }

        const bounds = L.latLngBounds(
          plotted.map((p) => [p.coords!.lat, p.coords!.lng] as [number, number]),
        )
        map.fitBounds(bounds, { padding: [40, 40] })

        setReady(true)
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    }

    // rootMargin starts the work a screen early, so the map is ready by the
    // time it is scrolled to rather than building in front of the reader.
    // Where IntersectionObserver is missing, build immediately: a map that
    // loads eagerly beats one that never loads.
    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver === 'undefined') {
      buildMap()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect()
            observer = null
            buildMap()
          }
        },
        { rootMargin: '600px 0px' },
      )
      observer.observe(container)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      observer = null
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
      historicRef.current = null
    }
  }, [plotted])

  // Repaint icons on selection rather than rebuilding every marker.
  useEffect(() => {
    const L = leafletRef.current
    if (!L) return
    for (const place of plotted) {
      const marker = markersRef.current[place.slug]
      if (!marker) continue
      const isSelected = place.slug === selected
      marker.setIcon(
        L.divIcon({
          className: 'charlie-marker',
          html: markerHtml(place, isSelected),
          // Must match the sizes used when the marker is created, or the
          // repaint on first selection silently resizes every marker.
          // 20 = 1px border + 3px padding + 12px swatch, doubled.
          iconSize: isSelected ? [24, 24] : [20, 20],
          iconAnchor: isSelected ? [12, 12] : [10, 10],
        }),
      )
    }
  }, [selected, plotted, ready])

  // Add and remove the historic overlay.
  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current
    if (!L || !map || !historicLayer) return

    if (showHistoric && !historicRef.current) {
      historicRef.current = L.tileLayer(historicLayer.url, {
        attribution: historicLayer.attribution,
        minZoom: historicLayer.minZoom,
        maxZoom: historicLayer.maxZoom,
        opacity: historicOpacity,
      }).addTo(map)
    } else if (!showHistoric && historicRef.current) {
      map.removeLayer(historicRef.current)
      historicRef.current = null
    }
  }, [showHistoric, historicOpacity, ready])

  useEffect(() => {
    historicRef.current?.setOpacity(historicOpacity)
  }, [historicOpacity])

  const focusPlace = useCallback((slug: string) => {
    const marker = markersRef.current[slug]
    const map = mapRef.current
    if (!marker || !map) return
    map.panTo(marker.getLatLng())
    // openPopup fires popupopen, which sets the selection, so it is not set
    // here as well. Doing both left the icon and the popup out of step
    // whenever Leaflet closed one popup to open another.
    marker.openPopup()
  }, [])

  if (failed) {
    return (
      <p className="border border-rule bg-paper-warm p-6 font-sans text-small text-ink-soft">
        The map could not be loaded. Every place is listed below with its
        district and status.
      </p>
    )
  }

  return (
    <div className="border border-rule">
      <div className="relative">
        <div
          ref={containerRef}
          className="h-[60vh] min-h-[380px] max-h-[620px] w-full bg-paper-warm"
          role="application"
          aria-label="Map of the places Charlie Rogers painted across Gateshead and Newcastle"
        />
        {!ready ? (
          <p className="absolute inset-0 flex items-center justify-center font-sans text-small text-ink-mute">
            Loading the map
          </p>
        ) : null}
      </div>

      <div className="border-t border-rule bg-paper-warm px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
            <span className="inline-block h-3 w-3 border-2 border-ink-mute bg-ink-mute" aria-hidden="true" />
            Site estimate
          </span>
          <span className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
            <span className="inline-block h-3 w-3 border-2 border-ink-mute bg-paper" aria-hidden="true" />
            Street or area
          </span>

          {historicLayer ? (
            <span className="ml-auto flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
                <input
                  type="checkbox"
                  checked={showHistoric}
                  onChange={(e) => setShowHistoric(e.target.checked)}
                  className="h-4 w-4 accent-bensham"
                />
                {historicLayer.label}
              </label>
              {showHistoric ? (
                <label className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
                  Fade
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={historicOpacity}
                    onChange={(e) => setHistoricOpacity(Number(e.target.value))}
                    className="w-28 accent-bensham"
                    aria-label={`Opacity of the ${historicLayer.label} overlay`}
                  />
                </label>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      {/* The map is a view of the list, never the only way to reach a place.
          These buttons give keyboard and screen reader users the same pins. */}
      <div className="border-t border-rule p-4 sm:p-6">
        <h3 className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
          Jump to a place on the map
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {plotted.map((place) => (
            <li key={place.slug}>
              <button
                type="button"
                onClick={() => focusPlace(place.slug)}
                aria-pressed={selected === place.slug}
                className={`font-sans text-small underline underline-offset-4 ${
                  selected === place.slug ? 'text-bensham' : 'text-ink-soft'
                }`}
              >
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
