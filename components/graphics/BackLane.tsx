import { rng, stroke, outline, wash, type Rng } from '@/lib/sketch'
import { InkDefs, Smoke } from './Ink'

// The view from Aunt Violet's window in 1964: the back lane of Cotfield
// Street, in pen and wash. The backs of two terraces run away to a vanishing
// point: chimney stacks along the roofs, back windows, yard walls with ledged
// gates and coal hatches, setts underfoot with a gutter down the middle. A
// line of washing is strung across the lane and moves in the wind, a cat sits
// on a wall, a man walks his dog away from us. Lines draw themselves in as
// the section arrives, in the order a sketch is built: walls, then the
// houses behind, then the detail, then the people.

const W = 560
const H = 420
const VX = 296
const VY = 176

type P = [number, number]

// The point a fraction t of the way from (x, y) to the vanishing point.
function v(x: number, y: number, t: number): P {
  return [x + (VX - x) * t, y + (VY - y) * t]
}

function Ink({ d, w = 1.15, step = 0 }: { d: string; w?: number; step?: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      className="ink"
      style={{ transitionDelay: `${step * 0.55}s` }}
      fill="none"
      stroke="#1A1916"
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

type Side = {
  wall: string[]
  gates: string[]
  hatch: string[]
  houses: string[]
  stacks: string[]
  pots: P[]
  washes: { d: string; fill: string; opacity: number }[]
}

// One side of the lane. `sx` is the frame edge it starts from.
function side(r: Rng, sx: number, wallTop: number, eave: number, dark: boolean): Side {
  const out: Side = { wall: [], gates: [], hatch: [], houses: [], stacks: [], pots: [], washes: [] }
  const far = 0.84
  const floor = H

  // yard wall: coping, its underside, and the foot
  out.wall.push(stroke(r, sx, wallTop, ...v(sx, wallTop, far), 1.6))
  out.wall.push(stroke(r, sx, wallTop + 9, ...v(sx, wallTop + 9, far), 1.6))
  out.wall.push(stroke(r, sx, floor, ...v(sx, floor, far), 1.6))

  // backs of the houses behind the wall: eave line and roof
  out.houses.push(stroke(r, sx, eave, ...v(sx, eave, far), 1.6))
  out.houses.push(stroke(r, sx, eave - 26, ...v(sx, eave - 26, far), 1.6))

  const bays = [0, 0.16, 0.31, 0.44, 0.55, 0.64, 0.71, 0.77, far]
  for (let b = 0; b < bays.length - 1; b++) {
    const t0 = bays[b]
    const t1 = bays[b + 1]
    // party wall between houses, from roof down to the wall coping
    const [px, py] = v(sx, eave - 26, t0)
    const [qx, qy] = v(sx, wallTop, t0)
    if (b > 0) out.houses.push(stroke(r, px, py, qx, qy, 0.6))

    // back window
    const a = 0.25
    const z = 0.7
    const tw0 = t0 + (t1 - t0) * a
    const tw1 = t0 + (t1 - t0) * z
    const top = eave + (wallTop - eave) * 0.18
    const bot = eave + (wallTop - eave) * 0.62
    const corners: P[] = [v(sx, top, tw0), v(sx, top, tw1), v(sx, bot, tw1), v(sx, bot, tw0)]
    out.houses.push(outline(r, corners, true, 0.4))
    const mid = (top + bot) / 2
    out.houses.push(stroke(r, ...v(sx, mid, tw0), ...v(sx, mid, tw1), 0.3))
    if (r() < 0.35) out.washes.push({ d: wash(r, corners, 0.8), fill: '#B8842C', opacity: 0.55 })

    // chimney stack on the ridge
    const [cx, cy] = v(sx, eave - 26, t0 + (t1 - t0) * 0.5)
    const scale = 1 - (t0 + t1) / 2
    const sw = 12 * scale + 4
    const sh = 18 * scale + 6
    out.stacks.push(outline(r, [[cx - sw / 2, cy], [cx - sw / 2, cy - sh], [cx + sw / 2, cy - sh], [cx + sw / 2, cy]], false, 0.4))
    out.washes.push({ d: wash(r, [[cx - sw / 2, cy], [cx - sw / 2, cy - sh], [cx + sw / 2, cy - sh], [cx + sw / 2, cy]], 0.8), fill: '#A85842', opacity: 0.4 })
    const pots = scale > 0.5 ? 3 : 2
    for (let k = 0; k < pots; k++) {
      const px2 = cx - sw / 2 + ((k + 0.5) * sw) / pots
      out.stacks.push(stroke(r, px2, cy - sh, px2, cy - sh - 5 * scale - 2, 0.2))
      if (k === 1 && b % 2 === 0) out.pots.push([px2, cy - sh - 6 * scale - 3])
    }

    // gate in the yard wall: frame, ledges and the diagonal brace
    const g0 = t0 + (t1 - t0) * 0.3
    const g1 = t0 + (t1 - t0) * 0.62
    const gTop = wallTop + 16
    const gBot = floor - 4
    const g: P[] = [v(sx, gTop, g0), v(sx, gTop, g1), v(sx, gBot, g1), v(sx, gBot, g0)]
    out.gates.push(outline(r, g, true, 0.6))
    out.gates.push(stroke(r, ...v(sx, gTop + (gBot - gTop) * 0.2, g0), ...v(sx, gTop + (gBot - gTop) * 0.2, g1), 0.3))
    out.gates.push(stroke(r, ...v(sx, gTop + (gBot - gTop) * 0.8, g0), ...v(sx, gTop + (gBot - gTop) * 0.8, g1), 0.3))
    out.gates.push(stroke(r, ...v(sx, gTop + (gBot - gTop) * 0.8, g0), ...v(sx, gTop + (gBot - gTop) * 0.2, g1), 0.3))
    out.washes.push({ d: wash(r, g, 1), fill: ['#8B9B7A', '#4A5B6E', '#7A1F1F', '#8B9B7A'][b % 4], opacity: 0.35 })

    // coal hatch beside the gate, on the nearer bays
    if (t0 < 0.5) {
      const h0 = t0 + (t1 - t0) * 0.72
      const h1 = t0 + (t1 - t0) * 0.88
      const hy0 = floor - (floor - wallTop) * 0.42
      const hy1 = floor - (floor - wallTop) * 0.22
      out.hatch.push(outline(r, [v(sx, hy0, h0), v(sx, hy0, h1), v(sx, hy1, h1), v(sx, hy1, h0)], true, 0.4))
    }
  }

  // shadow hatching on the dark side: short diagonal strokes down the wall
  if (dark) {
    for (let i = 0; i < 70; i++) {
      const t = r() * 0.7
      const y = wallTop + 14 + r() * (floor - wallTop - 30)
      const [x, yy] = v(sx, y, t)
      const len = 8 * (1 - t) + 2
      out.hatch.push(stroke(r, x, yy, x + len * 0.6 * (sx === 0 ? 1 : -1), yy + len, 0.2))
    }
  }

  // washes: wall in brick, houses behind a shade darker, roof in slate
  out.washes.unshift(
    { d: wash(r, [[sx, wallTop], v(sx, wallTop, far), v(sx, floor, far), [sx, floor]], 4), fill: '#A85842', opacity: dark ? 0.34 : 0.22 },
    { d: wash(r, [[sx, eave], v(sx, eave, far), v(sx, wallTop, far), [sx, wallTop]], 4), fill: '#A85842', opacity: dark ? 0.24 : 0.16 },
    { d: wash(r, [[sx, eave - 26], v(sx, eave - 26, far), v(sx, eave, far), [sx, eave]], 3), fill: '#4A5B6E', opacity: 0.3 },
  )
  return out
}

export function BackLane({ id = 'lane', className = '' }: { id?: string; className?: string }) {
  const r = rng(262)
  const L = side(r, 0, 196, 70, false)
  const R = side(r, W, 210, 84, true)

  // setts: courses across the lane, closer together as they recede, each
  // course broken into individual stones
  const setts: string[] = []
  for (let i = 0; i < 14; i++) {
    const t = 1 - Math.pow(0.84, i + 1)
    const [lx, ly] = v(30, H, t)
    const [rx, ry] = v(530, H, t)
    setts.push(stroke(r, lx, ly, rx, ry, 0.6))
    const stones = Math.max(4, Math.round(16 * (1 - t)))
    for (let s = 1; s < stones; s++) {
      const f = s / stones + (i % 2 ? 0.5 / stones : 0)
      if (f >= 1) continue
      const x = lx + (rx - lx) * f
      const y = ly + (ry - ly) * f
      const t2 = 1 - Math.pow(0.84, i)
      const [nx, ny] = v(30 + (500 * f), H, t2)
      setts.push(stroke(r, x, y, x + (nx - x) * 0.85, y + (ny - y) * 0.85, 0.2))
    }
  }
  const gutter = [stroke(r, 286, H, VX - 2, VY + 40, 0.8), stroke(r, 300, H, VX + 2, VY + 40, 0.8)]

  // the far end: the next street's houses closing the view, and the sky
  const endRow = outline(r, [[240, 170], [240, 128], [262, 116], [334, 116], [356, 128], [356, 170]], false, 0.6)
  const endStack = outline(r, [[292, 116], [292, 100], [306, 100], [306, 116]], false, 0.4)
  const endWin = [outline(r, [[256, 140], [270, 140], [270, 156], [256, 156]], true, 0.3), outline(r, [[324, 140], [338, 140], [338, 156], [324, 156]], true, 0.3)]

  // a telegraph pole on the right with wires sagging across
  const pole = [stroke(r, 470, 404, 474, 18, 0.6), stroke(r, 452, 40, 494, 36, 0.4), stroke(r, 456, 54, 492, 51, 0.4)]
  const wires = [`M452 40Q300 92 ${VX} ${VY - 64}`, `M492 36Q560 52 570 60`, `M456 54Q320 100 ${VX} ${VY - 56}`]

  // gas lamp on a bracket on the left wall
  const lamp = [stroke(r, 26, 196, 26, 164, 0.3), stroke(r, 26, 168, 46, 168, 0.3), outline(r, [[40, 168], [52, 168], [50, 186], [42, 186]], true, 0.3), stroke(r, 38, 168, 54, 168, 0.2)]

  // washing line, sagging across the lane between two back windows
  const line = `M70 150Q300 214 520 162`
  const props = [stroke(r, 300, 188, 304, 262, 0.4)]
  type G = { kind: 'shirt' | 'sheet' | 'drawers' | 'towel'; x: number; y: number; w: number; h: number; fill: string; delay: number }
  const garments: G[] = [
    { kind: 'sheet', x: 104, y: 164, w: 44, h: 52, fill: '#FAF6EE', delay: 0 },
    { kind: 'shirt', x: 160, y: 176, w: 34, h: 36, fill: '#4A5B6E', delay: 0.5 },
    { kind: 'drawers', x: 210, y: 184, w: 26, h: 36, fill: '#FAF6EE', delay: 1.0 },
    { kind: 'towel', x: 252, y: 189, w: 22, h: 28, fill: '#A85842', delay: 0.2 },
    { kind: 'sheet', x: 318, y: 188, w: 46, h: 54, fill: '#FAF6EE', delay: 0.8 },
    { kind: 'shirt', x: 382, y: 182, w: 32, h: 34, fill: '#8B9B7A', delay: 1.3 },
    { kind: 'towel', x: 432, y: 174, w: 20, h: 26, fill: '#B8842C', delay: 0.4 },
  ]
  function garment(g: G, gr: Rng): string {
    const { x, y, w, h } = g
    if (g.kind === 'shirt') {
      return wash(gr, [[x, y], [x + w * 0.3, y - 1], [x + w * 0.5, y + 4], [x + w * 0.7, y - 1], [x + w, y], [x + w + 8, y + h * 0.35], [x + w - 2, y + h * 0.42], [x + w - 3, y + h], [x + 3, y + h], [x + 2, y + h * 0.42], [x - 8, y + h * 0.35]], 0.8)
    }
    if (g.kind === 'drawers') {
      return wash(gr, [[x, y], [x + w, y], [x + w + 2, y + h], [x + w * 0.6, y + h], [x + w * 0.5, y + h * 0.4], [x + w * 0.4, y + h], [x - 2, y + h]], 0.8)
    }
    return wash(gr, [[x, y], [x + w, y - 1], [x + w + 1, y + h], [x + w * 0.5, y + h - 3], [x - 1, y + h - 1]], 0.8)
  }

  // the man in his cap and coat, walking away, and his dog on a lead
  const man = [
    stroke(r, 262, 330, 266, 300, 0.3),
    stroke(r, 274, 330, 271, 300, 0.3),
    outline(r, [[258, 302], [260, 266], [278, 266], [281, 302]], true, 0.4),
    stroke(r, 260, 272, 254, 296, 0.3),
    stroke(r, 278, 272, 286, 292, 0.3),
    `M269 259m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0`,
    `M260 254Q269 246 280 253L258 254`,
  ]
  const lead = `M286 292Q298 300 306 308`
  const dog = `M300 318l1-9q8-5 18-1l2 10M301 309q-4-1-6-6l1-3M318 308l5-6l2 4`

  // the cat on the left wall, tail hanging
  const cat = [`M60 192q0-12 6-14l2-5l2 5l3-5l1 6q4 4 2 13z`, `M74 192q6 8 3 18`]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      <InkDefs id={id} />

      {/* Washes go in after the pen, as Charlie worked */}
      <g filter={`url(#${id}-wash)`} className="wash-in">
        <path d={wash(r, [[0, 0], [W, 0], [W, 80], [VX, VY - 60], [0, 66]], 6)} fill="#4A5B6E" opacity={0.18} />
        <path d={wash(r, [[160, 30], [420, 20], [380, 70], [200, 78]], 10)} fill="#FAF6EE" opacity={0.6} />
        {[...L.washes, ...R.washes].map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} opacity={s.opacity} />
        ))}
        <path d={wash(r, [[30, H], [VX - 26, VY + 30], [VX + 26, VY + 30], [530, H]], 4)} fill="#6B6860" opacity={0.18} />
        <path d={wash(r, [[240, 170], [240, 128], [262, 116], [334, 116], [356, 128], [356, 170]], 2)} fill="#44423D" opacity={0.3} />
        {/* a puddle in the gutter, catching the sky */}
        <path d={wash(r, [[262, 372], [330, 368], [342, 384], [270, 390]], 4)} fill="#4A5B6E" opacity={0.25} />
      </g>

      <g filter={`url(#${id}-ink)`}>
        {[...L.wall, ...R.wall].map((d, i) => <Ink key={`w${i}`} d={d} step={0} />)}
        {[...L.houses, ...R.houses].map((d, i) => <Ink key={`h${i}`} d={d} w={0.9} step={1} />)}
        {[...L.stacks, ...R.stacks].map((d, i) => <Ink key={`s${i}`} d={d} w={0.9} step={1.5} />)}
        <Ink d={endRow} step={1.5} />
        <Ink d={endStack} w={0.9} step={1.5} />
        {endWin.map((d, i) => <Ink key={`ew${i}`} d={d} w={0.7} step={2} />)}
        {[...L.gates, ...R.gates].map((d, i) => <Ink key={`g${i}`} d={d} w={0.9} step={2} />)}
        {[...L.hatch, ...R.hatch].map((d, i) => <Ink key={`k${i}`} d={d} w={0.6} step={2.5} />)}
        {setts.map((d, i) => <Ink key={`c${i}`} d={d} w={0.55} step={2.5} />)}
        {gutter.map((d, i) => <Ink key={`gu${i}`} d={d} w={0.7} step={2.5} />)}
        {pole.map((d, i) => <Ink key={`p${i}`} d={d} w={1.3} step={3} />)}
        {wires.map((d, i) => <Ink key={`wi${i}`} d={d} w={0.5} step={3} />)}
        {lamp.map((d, i) => <Ink key={`l${i}`} d={d} w={0.9} step={3} />)}
        <Ink d={line} w={0.7} step={3.5} />
        {props.map((d, i) => <Ink key={`pr${i}`} d={d} w={0.9} step={3.5} />)}
        <g className="walker">
          {man.map((d, i) => <Ink key={`m${i}`} d={d} w={1} step={4} />)}
          <Ink d={lead} w={0.6} step={4} />
          <Ink d={dog} w={1} step={4} />
        </g>
        {cat.map((d, i) => <Ink key={`cat${i}`} d={d} w={0.9} step={4} />)}
      </g>

      {/* the man's coat and the lamp glass */}
      <g className="wash-in">
        <path d={wash(r, [[259, 302], [261, 267], [277, 267], [280, 302]], 1)} fill="#44423D" opacity={0.55} className="walker" />
        <path d={wash(r, [[41, 169], [51, 169], [49, 185], [43, 185]], 0.5)} fill="#B8842C" opacity={0.6} className="lamp-glow" />
        <path d="M60 192q0-12 6-14l2-5l2 5l3-5l1 6q4 4 2 13z" fill="#1A1916" opacity={0.75} />
      </g>

      {[...L.pots, ...R.pots].map(([x, y], i) => (
        <Smoke key={i} x={x} y={y} filter={`${id}-smoke`} delay={i * 1.3} />
      ))}
      <Smoke x={299} y={96} filter={`${id}-smoke`} delay={0.6} />

      {/* the cat's tail flicks */}
      <path d="M74 192q6 8 3 18" fill="none" stroke="#1A1916" strokeWidth={1.4} strokeLinecap="round" className="cat-tail" style={{ transformOrigin: '74px 192px' }} />

      {garments.map((g, i) => (
        <g key={i} className="washing" style={{ transformOrigin: `${g.x + g.w / 2}px ${g.y}px`, animationDelay: `${g.delay}s` }}>
          <path d={garment(g, rng(i + 40))} fill={g.fill} stroke="#1A1916" strokeWidth={0.85} strokeLinejoin="round" opacity={0.96} />
          <path d={`M${g.x + 3} ${g.y - 3}v6M${g.x + g.w - 3} ${g.y - 3}v6`} stroke="#1A1916" strokeWidth={1.1} />
        </g>
      ))}
    </svg>
  )
}
