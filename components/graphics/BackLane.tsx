import { rng, stroke, outline, wash, type Rng } from '@/lib/sketch'
import { InkDefs, Smoke } from './Ink'

// The view from Aunt Violet's window in 1964: the back lane of Cotfield
// Street in pen and wash. Yard walls run away to a vanishing point, gates and
// coal hatches along them, cobbles underfoot, washing strung across the lane
// moving in the wind, a man and his dog walking away. The lines draw
// themselves in as the section arrives, as the first painting did over five
// or six mornings.

const VX = 300
const VY = 168

// A point a fraction t of the way from a to the vanishing point.
function toward(x: number, y: number, t: number): [number, number] {
  return [x + (VX - x) * t, y + (VY - y) * t]
}

function Ink({ d, w = 1.2 }: { d: string; w?: number }) {
  return <path d={d} pathLength={1} className="ink" fill="none" stroke="#1A1916" strokeWidth={w} strokeLinecap="round" />
}

function wallLines(r: Rng, side: 'l' | 'r') {
  const sx = side === 'l' ? 0 : 560
  const top = side === 'l' ? 70 : 92
  const bottom = 420
  const lines: string[] = []
  // top coping and foot of the wall, running to the vanishing point
  const [tx, ty] = toward(sx, top, 0.82)
  const [bx, by] = toward(sx, bottom, 0.82)
  lines.push(stroke(r, sx, top, tx, ty, 2))
  lines.push(stroke(r, sx, top + 10, ...toward(sx, top + 10, 0.82), 2))
  lines.push(stroke(r, sx, bottom, bx, by, 2))
  // gates and hatches along the wall, smaller as they recede
  for (const t of [0.12, 0.38, 0.58, 0.72]) {
    const [x1, y1] = toward(sx, top + 22, t)
    const [x2, y2] = toward(sx, top + 22, t + 0.07)
    const [x3, y3] = toward(sx, bottom - 6, t + 0.07)
    const [x4, y4] = toward(sx, bottom - 6, t)
    lines.push(outline(r, [[x1, y1], [x2, y2], [x3, y3], [x4, y4]], true, 0.8))
  }
  // brick courses, a few hatched strokes only
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + r() * 0.6
    const yy = top + 40 + r() * (bottom - top - 80)
    const [a, b] = toward(sx, yy, t)
    const [c, d] = toward(sx, yy, t + 0.04)
    lines.push(stroke(r, a, b, c, d, 0.4))
  }
  return lines
}

export function BackLane({ id = 'lane', className = '' }: { id?: string; className?: string }) {
  const r = rng(262)
  const left = wallLines(r, 'l')
  const right = wallLines(r, 'r')

  // cobbles: courses across the lane, closer together as they recede
  const cobbles: string[] = []
  for (let i = 0; i < 9; i++) {
    const t = 1 - Math.pow(0.78, i + 1)
    const [lx, ly] = toward(40, 420, t)
    const [rx, ry] = toward(520, 420, t)
    cobbles.push(stroke(r, lx, ly, rx, ry, 1))
  }
  const gutter = stroke(r, 280, 420, VX, VY + 60, 1)

  // houses at the end of the lane
  const endRow = outline(r, [[236, 150], [236, 112], [262, 98], [338, 98], [364, 112], [364, 150]], false, 0.6)
  const endStack = outline(r, [[300, 98], [300, 84], [312, 84], [312, 98]], false, 0.4)

  // washing line, sagging across the lane
  const lineD = `M60 128Q300 178 520 122`
  const garments: { x: number; y: number; w: number; h: number; fill: string; delay: number }[] = [
    { x: 120, y: 142, w: 34, h: 40, fill: '#F2EBDC', delay: 0 },
    { x: 178, y: 150, w: 26, h: 30, fill: '#4A5B6E', delay: 0.6 },
    { x: 262, y: 154, w: 42, h: 46, fill: '#F2EBDC', delay: 1.1 },
    { x: 336, y: 151, w: 22, h: 26, fill: '#A85842', delay: 0.3 },
    { x: 400, y: 143, w: 30, h: 34, fill: '#F2EBDC', delay: 0.9 },
  ]

  // a man and his dog, walking away down the lane
  const man = [
    stroke(r, 268, 300, 270, 276, 0.3),
    stroke(r, 276, 300, 274, 276, 0.3),
    outline(r, [[264, 278], [266, 250], [280, 250], [282, 278]], true, 0.4),
    `M273 244m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`,
    `M265 240Q273 234 282 240L263 240`,
  ]

  return (
    <svg viewBox="0 0 560 420" className={`block h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      <InkDefs id={id} />
      <g filter={`url(#${id}-wash)`} className="wash-in">
        <path d={wash(r, [[0, 70], [...toward(0, 70, 0.82)], [...toward(0, 420, 0.82)], [0, 420]], 4)} fill="#A85842" opacity={0.2} />
        <path d={wash(r, [[560, 92], [...toward(560, 92, 0.82)], [...toward(560, 420, 0.82)], [560, 420]], 4)} fill="#A85842" opacity={0.26} />
        <path d={wash(r, [[40, 420], [VX - 30, VY + 20], [VX + 30, VY + 20], [520, 420]], 4)} fill="#4A5B6E" opacity={0.14} />
        <path d={wash(r, [[0, 0], [560, 0], [560, 96], [VX, VY - 70], [0, 72]], 6)} fill="#4A5B6E" opacity={0.12} />
        <path d={wash(r, [[236, 150], [236, 112], [262, 98], [338, 98], [364, 112], [364, 150]], 2)} fill="#44423D" opacity={0.25} />
      </g>

      <g filter={`url(#${id}-ink)`}>
        {[...left, ...right].map((d, i) => (
          <Ink key={`w${i}`} d={d} />
        ))}
        {cobbles.map((d, i) => (
          <Ink key={`c${i}`} d={d} w={0.8} />
        ))}
        <Ink d={gutter} w={0.8} />
        <Ink d={endRow} />
        <Ink d={endStack} w={0.9} />
        <Ink d={lineD} w={0.8} />
        {man.map((d, i) => (
          <Ink key={`m${i}`} d={d} w={1} />
        ))}
        {/* the dog */}
        <Ink d="M290 300l1-8q6-4 14-1l2 9M290 293q-4-2-5-6M305 291l4-5" w={1} />
      </g>

      <Smoke x={306} y={80} filter={`${id}-smoke`} />

      {garments.map((g, i) => (
        <g key={i} className="washing" style={{ transformOrigin: `${g.x + g.w / 2}px ${g.y}px`, animationDelay: `${g.delay}s` }}>
          <path d={wash(rng(i + 40), [[g.x, g.y], [g.x + g.w, g.y - 2], [g.x + g.w + 2, g.y + g.h], [g.x - 1, g.y + g.h - 3]], 1.5)} fill={g.fill} stroke="#1A1916" strokeWidth={0.9} opacity={0.95} />
          <path d={`M${g.x + 4} ${g.y - 2}v5M${g.x + g.w - 4} ${g.y - 3}v5`} stroke="#1A1916" strokeWidth={1} />
        </g>
      ))}
    </svg>
  )
}
