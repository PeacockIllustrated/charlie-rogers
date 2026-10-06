import { rng, type Rng } from '@/lib/sketch'
import { Smoke } from './Ink'
import { DrawIn } from './DrawIn'

// The footer's horizon: a Tyneside street at dusk, cut freehand in the
// book's deep red so every page ends looking up a street.
//
// Two rows of roofs, the far one paler and drifting slower as the page
// scrolls, give the street depth. The near roofline is one wobbling cut:
// pitched roofs at uneven heights, chimney stacks with leaning pots, TV
// aerials, a chapel spire and a corner pub whose sign swings in the wind.
//
// It comes alive as it scrolls into view: windows light one by one as
// people get home, and a lamplighter walks the pavement with his pole,
// each gas lamp coming on as he reaches it. Pigeons cross, chimneys smoke.
// With reduced motion the street is simply lit and still.

const W = 1900
const H = 196
const NEAR = 44 // how far the near row sits below the top of the drawing
const FAR = 20
const STREET = 176 // the top of the pavement
type P = [number, number]

function line(pts: P[]): string {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z'
}

type Row = {
  roof: string
  stacks: string[]
  pots: P[]
  aerials: string[]
  windows: [number, number, number, number][]
  spire: number | null
  pub: { x: number; eave: number } | null
}

// One row of houses along the street. `features` adds the chapel and pub.
function row(r: Rng, features: boolean, scale = 1): Row {
  const j = (n: number) => (r() - 0.5) * n
  const roof: P[] = [[-10, 160]]
  const out: Row = { roof: '', stacks: [], pots: [], aerials: [], windows: [], spire: null, pub: null }
  let x = -6
  let i = 0
  while (x < W + 10) {
    if (features && out.spire === null && x > W * 0.36) {
      const w = 70
      const base = 66
      roof.push([x, 96 + j(2)], [x + 2, base], [x + 16, base - 2], [x + 22, 28], [x + 26, 6], [x + 30, 28], [x + 36, base - 2], [x + w - 2, base], [x + w, 96 + j(2)])
      out.spire = x + 26
      out.windows.push([x + 23, 40, 6, 10], [x + 8, 76, 8, 16], [x + 50, 76, 8, 16])
      x += w
      continue
    }
    if (features && !out.pub && x > W * 0.68) {
      const w = 96
      const eave = 52
      roof.push([x, 90], [x + 1, eave + j(1)], [x + w, eave + j(1)], [x + w + 1, 90])
      out.stacks.push(line([[x + 12, eave + 1], [x + 12, eave - 16], [x + 26, eave - 16], [x + 26, eave + 1]]))
      out.pots.push([x + 19, eave - 22])
      out.windows.push([x + 14, 66, 12, 14], [x + 42, 66, 12, 14], [x + 70, 66, 12, 14], [x + 14, 98, 12, 16], [x + 70, 98, 12, 16])
      out.pub = { x: x + w + 2, eave }
      x += w + 4
      continue
    }
    const w = (58 + r() * 34) * scale
    const eave = 82 + r() * 18
    const ridge = eave - 16 - r() * 12
    const peak = x + w * (0.4 + r() * 0.2)
    roof.push([x + j(1.5), eave + j(2)], [peak - 6 + j(2), ridge + j(1.5)], [peak + 6 + j(2), ridge + j(1.5)], [x + w + j(1.5), eave + j(2)])

    if (i % 4 !== 2) {
      const cx = peak + (r() < 0.5 ? -1 : 1) * (8 + r() * 6)
      const cw = 10 + r() * 6
      const ch = 10 + r() * 8
      const top = ridge - ch
      out.stacks.push(line([[cx - cw / 2, ridge + 6], [cx - cw / 2 + j(1), top], [cx + cw / 2 + j(1), top], [cx + cw / 2, ridge + 6]]))
      const n = r() < 0.5 ? 2 : 3
      for (let k = 0; k < n; k++) {
        const px = cx - cw / 2 + ((k + 0.5) * cw) / n
        const lean = j(3)
        out.stacks.push(line([[px - 1.6, top + 0.5], [px - 1.4 + lean, top - 5], [px + 1.4 + lean, top - 5], [px + 1.6, top + 0.5]]))
        if (k === 0) out.pots.push([px + lean, top - 6])
      }
    }
    if (i % 3 === 1) {
      const ax = peak + j(10)
      const top = ridge - 22 - r() * 8
      out.aerials.push(`M${ax} ${ridge}L${ax + 0.6} ${top}M${ax - 9} ${top + 4}L${ax + 9} ${top + 3}M${ax - 6} ${top + 9}L${ax + 6} ${top + 8}M${ax - 3} ${top + 14}L${ax + 4} ${top + 13}`)
    }
    out.windows.push([x + w * 0.22, eave + 10, 9, 12], [x + w * 0.62, eave + 10, 9, 12])
    x += w - 2
    i++
  }
  roof.push([W + 10, 160])
  out.roof = line(roof)
  return out
}

export function Skyline({ id = 'sky', className = '' }: { id?: string; className?: string }) {
  const far = row(rng(77), false, 0.8)
  const near = row(rng(1931), true)
  const r = rng(5)

  // Which windows light at dusk, and when: a scatter, not left to right.
  const dusk = near.windows
    .map((w, k) => ({ w, k, on: (k * 7) % 10 < 6, d: 0.4 + r() * 4.5 }))
    .filter((w) => w.on)
  const smokers = near.pots.filter((_, k) => k % 3 !== 1)

  // Gas lamps along the pavement. The lamplighter takes LAP seconds to cross;
  // each lamp comes on as he reaches it, and all go out together before he
  // starts again.
  const LAP = 44
  const WALK = 84 // percent of the cycle he spends walking
  const lamps = Array.from({ length: 10 }, (_, k) => 120 + k * 186 + (r() - 0.5) * 30)
  const onAt = (x: number) => ((x + 40) / (W + 80)) * WALK
  const css = [
    `.${id}-lighter{animation:${id}-walk ${LAP}s linear infinite}`,
    `@keyframes ${id}-walk{0%{transform:translateX(-40px)}${WALK}%{transform:translateX(${W + 40}px)}${WALK + 0.01}%,100%{transform:translateX(-40px)}}`,
    ...lamps.map((x, k) => {
      const p = onAt(x).toFixed(2)
      const q = (onAt(x) + 0.8).toFixed(2)
      return `.${id}-lamp${k}{animation:${id}-lamp${k} ${LAP}s linear infinite}@keyframes ${id}-lamp${k}{0%,${p}%{opacity:0}${q}%,95%{opacity:1}98%,100%{opacity:0}}`
    }),
    `@media (prefers-reduced-motion: reduce){.${id}-lighter{display:none}${lamps.map((_, k) => `.${id}-lamp${k}`).join(',')}{animation:none;opacity:1}}`,
  ].join('')

  // the flock: pigeons strung out in a loose line, each beating its own time
  const flock = Array.from({ length: 9 }, (_, k) => ({
    x: k * 22 + (r() - 0.5) * 10,
    y: (k % 3) * 7 + (r() - 0.5) * 6,
    s: 0.8 + r() * 0.5,
    d: r() * 0.4,
  }))

  return (
    <DrawIn className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="-mb-px block h-[136px] w-full sm:h-[196px]"
        aria-hidden="true"
        focusable="false"
      >
        <style>{css}</style>
        <defs>
          <filter id={`${id}-smoke`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          {/* roughens the cut edge so the silhouette reads as hand-cut paper */}
          <filter id={`${id}-cut`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={4} />
            <feDisplacementMap in="SourceGraphic" scale={2.2} />
          </filter>
          <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id={`${id}-dusk`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.15" stopColor="#FAF6EE" stopOpacity={0} />
            <stop offset="0.75" stopColor="#E7C99A" stopOpacity={0.55} />
          </linearGradient>
        </defs>

        {/* the last of the light, low over the roofs */}
        <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-dusk)`} />

        <g className="flock">
          {flock.map((b, k) => (
            <g key={k} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
              <path
                d="M-6 0Q-3 -4 0 0Q3 -4 6 0"
                fill="none"
                stroke="#5E1414"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="wingbeat"
                style={{ animationDelay: `${b.d}s` }}
              />
            </g>
          ))}
        </g>

        {/* the next street over, paler, drifting slower than the page */}
        <g className="sky-far">
          <g transform={`translate(0 ${FAR})`} fill="#A85842" opacity={0.32} filter={`url(#${id}-cut)`}>
            <path d={far.roof} />
            {far.stacks.map((d, k) => (
              <path key={k} d={d} />
            ))}
          </g>
        </g>

        <g transform={`translate(0 ${NEAR})`}>
          {smokers.map(([sx, sy], k) => (
            <Smoke key={k} x={sx} y={sy} filter={`${id}-smoke`} delay={k * 0.9} tone="ink" />
          ))}

          <g fill="#5E1414" filter={`url(#${id}-cut)`}>
            <path d={near.roof} />
            {near.stacks.map((d, k) => (
              <path key={k} d={d} />
            ))}
          </g>
          <g fill="none" stroke="#5E1414" strokeWidth={1.2} strokeLinecap="round">
            {near.aerials.map((d, k) => (
              <path key={k} d={d} />
            ))}
            {near.spire !== null && <path d={`M${near.spire} 6L${near.spire} -4M${near.spire - 4} -1L${near.spire + 4} -1`} />}
          </g>

          {near.pub && (
            <g>
              <path d={`M${near.pub.x - 3} ${near.pub.eave + 12}L${near.pub.x + 22} ${near.pub.eave + 12}`} stroke="#5E1414" strokeWidth={2.2} />
              <g className="pub-sign" style={{ transformOrigin: `${near.pub.x + 12}px ${near.pub.eave + 12}px` }}>
                <path d={`M${near.pub.x + 6} ${near.pub.eave + 12}v5M${near.pub.x + 18} ${near.pub.eave + 12}v5`} stroke="#5E1414" strokeWidth={1} />
                <rect x={near.pub.x + 3} y={near.pub.eave + 17} width={18} height={22} fill="#5E1414" />
                <rect x={near.pub.x + 6} y={near.pub.eave + 20} width={12} height={16} fill="none" stroke="#B8842C" strokeWidth={0.8} opacity={0.8} />
              </g>
            </g>
          )}

          {/* windows light one by one as the street scrolls into view; some
              then go on and off through the evening */}
          {dusk.map(({ w: [wx, wy, ww, wh], k, d }) => (
            <g key={k} className="dusk-window" style={{ transitionDelay: `${d.toFixed(2)}s` }}>
              <rect
                x={wx}
                y={wy}
                width={ww}
                height={wh}
                fill="#D9A441"
                className={k % 4 === 1 ? 'window-glow' : undefined}
                style={k % 4 === 1 ? { animationDelay: `${(k * 1.7) % 9}s` } : undefined}
              />
            </g>
          ))}
        </g>

        {/* the pavement, the lamps along it, and the lamplighter */}
        <path d={`M0 ${STREET}L${W} ${STREET - 1}L${W} ${H}L0 ${H}Z`} fill="#4A1010" />
        {lamps.map((x, k) => (
          <g key={k}>
            <path d={`M${x - 1.3} ${STREET + 2}L${x - 1} ${STREET - 50}L${x + 1} ${STREET - 50}L${x + 1.3} ${STREET + 2}ZM${x - 7} ${STREET - 50}L${x + 7} ${STREET - 50}L${x + 4} ${STREET - 62}L${x - 4} ${STREET - 62}ZM${x - 3} ${STREET - 62}L${x} ${STREET - 66}L${x + 3} ${STREET - 62}Z`} fill="#3A0B0B" />
            <g className={`${id}-lamp${k}`}>
              {/* A glow is a pool of light, round by nature, not a softened corner. */}
              <circle cx={x} cy={STREET - 56} r={16} fill="#E7B95A" opacity={0.55} filter={`url(#${id}-glow)`} />
              <path d={`M${x - 5} ${STREET - 51}L${x + 5} ${STREET - 51}L${x + 3} ${STREET - 60}L${x - 3} ${STREET - 60}Z`} fill="#F2CF7A" />
            </g>
          </g>
        ))}
        <g className={`${id}-lighter`}>
          <g className="walker">
            {/* coat, cap, legs mid-stride, and the long pole over his shoulder */}
            <path
              d={`M-5 ${STREET}L-3 ${STREET - 12}L3 ${STREET - 12}L5 ${STREET}L2 ${STREET}L0 ${STREET - 6}L-2 ${STREET}ZM-4 ${STREET - 12}L-5 ${STREET - 26}Q0 ${STREET - 29} 5 ${STREET - 26}L4 ${STREET - 12}ZM0 ${STREET - 28}m-3.4 0a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M-4 ${STREET - 31}L5 ${STREET - 31}L4 ${STREET - 33}L-3 ${STREET - 33}Z`}
              fill="#2A0808"
            />
            <path d={`M-2 ${STREET - 22}L18 ${STREET - 58}`} stroke="#2A0808" strokeWidth={1.4} strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </DrawIn>
  )
}
