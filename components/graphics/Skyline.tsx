import { rng } from '@/lib/sketch'
import { Smoke } from './Ink'

// The footer's horizon: a Tyneside street in silhouette against the evening,
// cut freehand in the book's deep red so every page ends looking up a street.
// The roofline is drawn as one wobbling line, not built from boxes: pitched
// roofs at different heights, chimney stacks with leaning pots, TV aerials,
// a chapel spire and a corner pub whose sign swings in the wind. Pigeons
// cross now and then, a few windows come on and go off, the chimneys smoke.

const W = 1900
const H = 150
type P = [number, number]

function line(pts: P[]): string {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z'
}

export function Skyline({ id = 'sky', className = '' }: { id?: string; className?: string }) {
  const r = rng(1931)
  const j = (n: number) => (r() - 0.5) * n

  const roof: P[] = [[0, H + 2]]
  const stacks: string[] = []
  const pots: P[] = []
  const aerials: string[] = []
  const windows: [number, number, number, number][] = []
  let spire: { x: number; base: number } | null = null
  let pub: { x: number; eave: number } | null = null

  let x = -6
  let i = 0
  while (x < W + 10) {
    // the chapel, a third of the way along
    if (!spire && x > W * 0.36) {
      const w = 70
      const base = 66
      roof.push([x, 96 + j(2)], [x + 2, base], [x + 16, base - 2], [x + 22, 28], [x + 26, 6], [x + 30, 28], [x + 36, base - 2], [x + w - 2, base], [x + w, 96 + j(2)])
      spire = { x: x + 26, base }
      windows.push([x + 23, 40, 6, 10])
      x += w
      continue
    }
    // the corner pub, taller and flat-fronted, two thirds along
    if (!pub && x > W * 0.68) {
      const w = 96
      const eave = 52
      roof.push([x, 90], [x + 1, eave + j(1)], [x + w, eave + j(1)], [x + w + 1, 90])
      stacks.push(line([[x + 12, eave + 1], [x + 12, eave - 16], [x + 26, eave - 16], [x + 26, eave + 1]]))
      pots.push([x + 19, eave - 22])
      windows.push([x + 14, 66, 12, 14], [x + 42, 66, 12, 14], [x + 70, 66, 12, 14])
      pub = { x: x + w + 2, eave }
      x += w + 4
      continue
    }
    const w = 58 + r() * 34
    const eave = 82 + r() * 18
    const ridge = eave - 16 - r() * 12
    const peak = x + w * (0.4 + r() * 0.2)
    // pitched roof: eave, up to the ridge, along it a little, down the far side
    roof.push([x + j(1.5), eave + j(2)], [peak - 6 + j(2), ridge + j(1.5)], [peak + 6 + j(2), ridge + j(1.5)], [x + w + j(1.5), eave + j(2)])

    // a chimney stack on most houses, its pots not quite straight
    if (i % 4 !== 2) {
      const cx = peak + (r() < 0.5 ? -1 : 1) * (8 + r() * 6)
      const cw = 10 + r() * 6
      const ch = 10 + r() * 8
      const top = ridge - ch
      stacks.push(line([[cx - cw / 2, ridge + 6], [cx - cw / 2 + j(1), top], [cx + cw / 2 + j(1), top], [cx + cw / 2, ridge + 6]]))
      const n = r() < 0.5 ? 2 : 3
      for (let k = 0; k < n; k++) {
        const px = cx - cw / 2 + ((k + 0.5) * cw) / n
        const lean = j(3)
        stacks.push(line([[px - 1.6, top + 0.5], [px - 1.4 + lean, top - 5], [px + 1.4 + lean, top - 5], [px + 1.6, top + 0.5]]))
        if (k === 0) pots.push([px + lean, top - 6])
      }
    }
    // a TV aerial on every third house
    if (i % 3 === 1) {
      const ax = peak + j(10)
      const ay = ridge
      const top = ay - 22 - r() * 8
      aerials.push(`M${ax} ${ay}L${ax + 0.6} ${top}M${ax - 9} ${top + 4}L${ax + 9} ${top + 3}M${ax - 6} ${top + 9}L${ax + 6} ${top + 8}M${ax - 3} ${top + 14}L${ax + 4} ${top + 13}`)
    }
    // windows under the eave
    windows.push([x + w * 0.22, eave + 14, 9, 12], [x + w * 0.62, eave + 14, 9, 12])
    x += w - 2
    i++
  }
  roof.push([W + 10, H + 2])

  const lit = windows.filter((_, k) => (k * 7) % 5 === 1)
  const smokers = pots.filter((_, k) => k % 3 !== 1)

  // the flock: pigeons strung out in a loose line, each beating its own time
  const flock = Array.from({ length: 9 }, (_, k) => ({
    x: k * 22 + j(10),
    y: (k % 3) * 7 + j(6),
    s: 0.8 + r() * 0.5,
    d: r() * 0.4,
  }))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className={`-mb-px block h-[110px] w-full sm:h-[150px] ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`${id}-smoke`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        {/* roughens the cut edge so the silhouette reads as hand-cut paper */}
        <filter id={`${id}-cut`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={4} />
          <feDisplacementMap in="SourceGraphic" scale={2.2} />
        </filter>
      </defs>

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

      {smokers.map(([sx, sy], k) => (
        <Smoke key={k} x={sx} y={sy} filter={`${id}-smoke`} delay={k * 0.9} tone="ink" />
      ))}

      <g fill="#5E1414" filter={`url(#${id}-cut)`}>
        <path d={line(roof)} />
        {stacks.map((d, k) => (
          <path key={k} d={d} />
        ))}
      </g>
      <g fill="none" stroke="#5E1414" strokeWidth={1.2} strokeLinecap="round">
        {aerials.map((d, k) => (
          <path key={k} d={d} />
        ))}
        {spire && <path d={`M${spire.x} 6L${spire.x} -4M${spire.x - 4} -1L${spire.x + 4} -1`} />}
      </g>

      {pub && (
        <g>
          <path d={`M${pub.x - 3} ${pub.eave + 12}L${pub.x + 22} ${pub.eave + 12}`} stroke="#5E1414" strokeWidth={2.2} />
          <g className="pub-sign" style={{ transformOrigin: `${pub.x + 12}px ${pub.eave + 12}px` }}>
            <path d={`M${pub.x + 6} ${pub.eave + 12}v5M${pub.x + 18} ${pub.eave + 12}v5`} stroke="#5E1414" strokeWidth={1} />
            <rect x={pub.x + 3} y={pub.eave + 17} width={18} height={22} fill="#5E1414" />
            <rect x={pub.x + 6} y={pub.eave + 20} width={12} height={16} fill="none" stroke="#B8842C" strokeWidth={0.8} opacity={0.8} />
          </g>
        </g>
      )}

      {lit.map(([wx, wy, ww, wh], k) => (
        <rect key={k} x={wx} y={wy} width={ww} height={wh} fill="#B8842C" className="window-glow" style={{ animationDelay: `${(k * 1.7) % 9}s` }} />
      ))}
    </svg>
  )
}
