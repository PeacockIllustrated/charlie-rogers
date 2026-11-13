import { DrawIn } from '@/components/graphics/DrawIn'
import type { WalkStop } from '@/lib/content/walk'
import type { Status } from '@/lib/content/types'

// The walk drawn as a sketch plan rather than a street map: the stops at
// their true relative positions, joined by a pen line in walking order, with
// north and a scale bar so the drawing can be trusted for distance. Straight
// lines between markers, not the streets, because the streets are what the
// walker is there to look at.
//
// Marker language is the Places map's: filled square for a site we can stand
// behind, hollow for a street or an area; sage standing, ochre altered,
// Bensham red gone.

const W = 760
const H = 560
const PAD = 56

const fill: Record<Status, string> = {
  extant: 'var(--sage)',
  altered: 'var(--ochre)',
  demolished: 'var(--bensham)',
  unknown: 'var(--ink-mute)',
}

export function WalkRoute({ stops }: { stops: WalkStop[] }) {
  const lats = stops.map((s) => s.place.coords!.lat)
  const lngs = stops.map((s) => s.place.coords!.lng)
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
  // A degree of longitude is shorter than a degree of latitude this far north.
  const kx = Math.cos((midLat * Math.PI) / 180)
  const spanX = (Math.max(...lngs) - Math.min(...lngs)) * kx
  const spanY = Math.max(...lats) - Math.min(...lats)
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
  const offX = (W - spanX * scale) / 2
  const offY = (H - spanY * scale) / 2

  const pts = stops.map((s) => ({
    x: offX + (s.place.coords!.lng - Math.min(...lngs)) * kx * scale,
    y: offY + (Math.max(...lats) - s.place.coords!.lat) * scale,
  }))

  // 500 metres in drawing units: one degree of latitude is about 111.2 km.
  const barPx = (0.5 / 111.2) * scale
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return (
    <DrawIn>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Sketch plan of the walk: ${stops
          .map((s, i) => `${i + 1}, ${s.place.name}`)
          .join('; ')}.`}
      >
        {/* The route, drawn in as the plan scrolls into view. */}
        <path
          d={path}
          pathLength={1}
          className="ink"
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {stops.map((s, i) => {
          const p = pts[i]
          const exact = s.place.coords!.precision === 'site'
          const colour = fill[s.place.status]
          const left = s.label === 'left'
          return (
            <g key={s.place.slug} className="wash-in">
              <rect x={p.x - 13} y={p.y - 13} width={26} height={26} fill="var(--paper)" stroke="var(--rule)" />
              <rect
                x={p.x - 8}
                y={p.y - 8}
                width={16}
                height={16}
                fill={exact ? colour : 'var(--paper)'}
                stroke={colour}
                strokeWidth={exact ? 0 : 2.5}
              />
              {/* On a phone the plan is drawn at under half size, so names
                  would be unreadable: it shows large numbers instead, and the
                  numbered list beside it carries the names. */}
              <text
                x={left ? p.x - 20 : p.x + 20}
                y={p.y + 10}
                textAnchor={left ? 'end' : 'start'}
                className="font-sans sm:hidden"
                fontSize={30}
                fill="var(--ink)"
              >
                {i + 1}
              </text>
              <text
                x={left ? p.x - 22 : p.x + 22}
                y={p.y - 2}
                textAnchor={left ? 'end' : 'start'}
                className="font-sans max-sm:hidden"
                fontSize={13}
                letterSpacing="0.08em"
                fill="var(--ink-mute)"
              >
                {String(i + 1).padStart(2, '0')}
              </text>
              <text
                x={left ? p.x - 22 : p.x + 22}
                y={p.y + 15}
                textAnchor={left ? 'end' : 'start'}
                className="font-serif max-sm:hidden"
                fontSize={17}
                fill={s.place.status === 'demolished' ? 'var(--bensham)' : 'var(--ink)'}
              >
                {s.place.name.replace(/ \(.*\)$/, '')}
              </text>
            </g>
          )
        })}

        {/* North and scale, set in the corner as on a surveyor's sheet. */}
        <g className="wash-in" stroke="var(--ink-soft)" fill="var(--ink-soft)">
          <path d={`M${W - 36} 58 L${W - 36} 22`} strokeWidth={1.2} />
          <path d={`M${W - 41} 30 L${W - 36} 20 L${W - 31} 30 Z`} stroke="none" />
          <text x={W - 36} y={76} textAnchor="middle" fontSize={12} stroke="none" className="font-sans">
            N
          </text>
          <path d={`M24 ${H - 28} L${24 + barPx} ${H - 28}`} strokeWidth={1.2} />
          <path d={`M24 ${H - 33} L24 ${H - 23} M${24 + barPx} ${H - 33} L${24 + barPx} ${H - 23}`} strokeWidth={1.2} />
          <text x={24} y={H - 40} fontSize={12} stroke="none" className="font-sans">
            500 m
          </text>
        </g>
      </svg>
    </DrawIn>
  )
}
