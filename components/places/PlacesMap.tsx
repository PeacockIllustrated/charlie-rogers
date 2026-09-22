'use client'

import 'leaflet/dist/leaflet.css'
// Must come after Leaflet's own stylesheet. See the note in places-map.css.
import './places-map.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
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

// A solid square is a position we can stand behind. A hollow one is a street or
// an area, not an address. Half of these buildings came down before anyone
// recorded where exactly they stood, and the map should not pretend otherwise.
function markerHtml(place: Place, selected: boolean): string {
  const exact = place.coords?.precision === 'site'
  const size = selected ? 'h-4 w-4' : 'h-3 w-3'
  const body = exact
    ? `${fill[place.status]} ${outline[place.status]}`
    : `bg-paper ${outline[place.status]}`
  const ring = selected ? 'outline outline-2 outline-offset-2 outline-ink' : ''
  return `<span class="block border-2 ${size} ${body} ${ring}"></span>`
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

  const selectedPlace = useMemo(
    () => plotted.find((p) => p.slug === selected) ?? null,
    [plotted, selected],
  )

  // Build the map once. plotted is derived from a module-level constant, so it
  // does not change across the life of the page.
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

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

        L.tileLayer(baseLayer.url, {
          attribution: baseLayer.attribution,
          minZoom: baseLayer.minZoom,
          maxZoom: baseLayer.maxZoom,
        }).addTo(map)

        for (const place of plotted) {
          if (!place.coords) continue
          const marker = L.marker([place.coords.lat, place.coords.lng], {
            icon: L.divIcon({
              className: 'charlie-marker',
              html: markerHtml(place, false),
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            }),
            keyboard: true,
            title: place.name,
            alt: `${place.name}, ${place.status}`,
          })
          marker.on('click', () => setSelected(place.slug))
          marker.on('keypress', () => setSelected(place.slug))
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

    return () => {
      cancelled = true
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
          iconSize: isSelected ? [16, 16] : [12, 12],
          iconAnchor: isSelected ? [8, 8] : [6, 6],
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
    setSelected(slug)
    const marker = markersRef.current[slug]
    const map = mapRef.current
    if (marker && map) map.panTo(marker.getLatLng())
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
            Exact site
          </span>
          <span className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
            <span className="inline-block h-3 w-3 border-2 border-ink-mute bg-paper" aria-hidden="true" />
            Street or area only
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

      {selectedPlace ? (
        <div className="border-t border-rule p-4 sm:p-6">
          <div className="flex flex-wrap items-start gap-6">
            {selectedPlace.image ? (
              <div className="bg-paper-warm p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  width={120}
                  height={90}
                  className="block h-auto w-[120px]"
                />
              </div>
            ) : null}
            <div className="max-w-reading">
              <h3 className="font-serif text-h4">{selectedPlace.name}</h3>
              <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                {selectedPlace.district}
              </p>
              {selectedPlace.coords &&
              selectedPlace.coords.precision !== 'site' ? (
                <p className="mt-3 font-sans text-small text-ink-soft">
                  {selectedPlace.coords.basis}
                </p>
              ) : null}
              <Link
                href={`/places/${selectedPlace.slug}`}
                className="mt-3 inline-block font-sans text-small text-bensham underline underline-offset-4"
              >
                Read about {selectedPlace.name}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
