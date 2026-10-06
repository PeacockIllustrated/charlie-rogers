// Hand-drawn line for the site's graphics. Charlie drew in pen first and
// washed colour in afterwards, and his lines are never ruled: they wander,
// overshoot at corners and are sometimes gone over twice. These helpers turn
// straight geometry into that kind of line, deterministically, so the server
// and the browser draw the same picture.

export type Rng = () => number

// mulberry32: a tiny seeded generator. The same seed always gives the same
// drawing, so a graphic never changes between renders.
export function rng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r1 = (n: number) => Math.round(n * 10) / 10

function jit(r: Rng, amount: number): number {
  return (r() - 0.5) * 2 * amount
}

// A pen stroke from one point to another: it overshoots the ends slightly and
// bows through a wobbled midpoint.
export function stroke(
  r: Rng,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  wobble = 1.2,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const over = Math.min(3, len * 0.04)
  const ux = dx / len
  const uy = dy / len
  const sx = x1 - ux * over * r() + jit(r, wobble * 0.4)
  const sy = y1 - uy * over * r() + jit(r, wobble * 0.4)
  const ex = x2 + ux * over * r() + jit(r, wobble * 0.4)
  const ey = y2 + uy * over * r() + jit(r, wobble * 0.4)
  const mx = (sx + ex) / 2 + jit(r, wobble)
  const my = (sy + ey) / 2 + jit(r, wobble)
  return `M${r1(sx)} ${r1(sy)}Q${r1(mx)} ${r1(my)} ${r1(ex)} ${r1(ey)}`
}

// A closed or open run of strokes through a list of points.
export function outline(r: Rng, pts: [number, number][], closed = true, wobble = 1.2): string {
  const parts: string[] = []
  const n = closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    parts.push(stroke(r, x1, y1, x2, y2, wobble))
  }
  return parts.join('')
}

// A wash: the colour laid in after the ink, never quite inside the lines.
export function wash(r: Rng, pts: [number, number][], spill = 2.5): string {
  const moved = pts.map(([x, y]) => [x + jit(r, spill), y + jit(r, spill)] as const)
  return `M${moved.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`
}

export type Shape = { d: string; fill?: string; opacity?: number }

export type Terrace = {
  ink: string[]
  washes: Shape[]
  // Clean outlines of each house and stack, for drawing the row in silhouette.
  blocks: string[]
  // Window openings as [x, y, w, h], for lighting them at dusk.
  windows: [number, number, number, number][]
  // Tops of the chimney pots, where smoke rises from.
  pots: [number, number][]
  width: number
}

const BRICK = '#A85842'
const SLATE = '#4A5B6E'
const OCHRE = '#B8842C'
const SAGE = '#8B9B7A'

// A row of Tyneside terraced houses standing on a baseline: pitched slate
// roofs, chimney stacks with pots, sash windows, a door and step each.
export function terrace(
  seed: number,
  {
    x = 0,
    base = 200,
    count = 10,
    w = [62, 84],
    h = [70, 96],
    washes = true,
  }: {
    x?: number
    base?: number
    count?: number
    w?: [number, number]
    h?: [number, number]
    washes?: boolean
  } = {},
): Terrace {
  const r = rng(seed)
  const ink: string[] = []
  const fills: Shape[] = []
  const pots: [number, number][] = []
  const blocks: string[] = []
  const windows: [number, number, number, number][] = []
  let cx = x
  for (let i = 0; i < count; i++) {
    const hw = w[0] + r() * (w[1] - w[0])
    const hh = h[0] + r() * (h[1] - h[0])
    const eave = base - hh
    const ridge = eave - 16 - r() * 10
    const left = cx
    const right = cx + hw

    // In silhouette a terrace reads as a stepped roofline, each house's ridge
    // a little higher or lower than the next, as the row climbs the bank.
    blocks.push(`M${r1(left - 0.5)} ${base}L${r1(left - 0.5)} ${r1(ridge)}L${r1(right + 0.5)} ${r1(ridge)}L${r1(right + 0.5)} ${base}Z`)

    // Walls and roof
    if (washes) {
      fills.push({
        d: wash(r, [[left, base], [left, eave], [right, eave], [right, base]]),
        fill: r() < 0.18 ? OCHRE : BRICK,
        opacity: 0.16 + r() * 0.1,
      })
      fills.push({
        d: wash(r, [[left - 2, eave], [left + 6, ridge], [right - 6, ridge], [right + 2, eave]]),
        fill: SLATE,
        opacity: 0.22 + r() * 0.1,
      })
    }
    ink.push(stroke(r, left, base, left, eave))
    ink.push(stroke(r, left - 3, eave, left + 6, ridge))
    ink.push(stroke(r, left + 6, ridge, right - 6, ridge))
    ink.push(stroke(r, right - 6, ridge, right + 3, eave))
    ink.push(stroke(r, left - 2, eave, right + 2, eave, 0.8))

    // Chimney stack on the party wall, with two or three pots
    const sx = right - 9
    const stackTop = ridge - 14 - r() * 6
    ink.push(outline(r, [[sx, ridge + 2], [sx, stackTop], [sx + 16, stackTop], [sx + 16, ridge + 2]], false, 0.6))
    blocks.push(`M${r1(sx)} ${r1(ridge + 4)}L${r1(sx)} ${r1(stackTop)}L${r1(sx + 16)} ${r1(stackTop)}L${r1(sx + 16)} ${r1(ridge + 4)}Z`)
    if (washes) fills.push({ d: wash(r, [[sx, ridge], [sx, stackTop], [sx + 16, stackTop], [sx + 16, ridge]], 1), fill: BRICK, opacity: 0.3 })
    const potCount = r() < 0.5 ? 2 : 3
    for (let p = 0; p < potCount; p++) {
      const px = sx + 2 + p * (12 / potCount) + 1
      blocks.push(`M${r1(px)} ${r1(stackTop)}L${r1(px)} ${r1(stackTop - 5)}L${r1(px + 3)} ${r1(stackTop - 5)}L${r1(px + 3)} ${r1(stackTop)}Z`)
      ink.push(stroke(r, px, stackTop, px + 0.5, stackTop - 5, 0.3))
      ink.push(stroke(r, px + 3, stackTop, px + 3.2, stackTop - 5, 0.3))
      pots.push([px + 1.5, stackTop - 6])
    }

    // Windows: two up, one down, and a door
    const winW = hw * 0.24
    const winH = hh * 0.22
    const upY = eave + hh * 0.16
    for (const wx of [left + hw * 0.14, left + hw * 0.6]) {
      windows.push([r1(wx), r1(upY), r1(winW), r1(winH)])
      ink.push(outline(r, [[wx, upY], [wx + winW, upY], [wx + winW, upY + winH], [wx, upY + winH]], true, 0.5))
      ink.push(stroke(r, wx, upY + winH / 2, wx + winW, upY + winH / 2, 0.3))
      if (washes && r() < 0.3) fills.push({ d: wash(r, [[wx, upY], [wx + winW, upY], [wx + winW, upY + winH], [wx, upY + winH]], 0.8), fill: OCHRE, opacity: 0.5 })
    }
    const downY = eave + hh * 0.56
    const dwx = left + hw * 0.12
    ink.push(outline(r, [[dwx, downY], [dwx + winW * 1.3, downY], [dwx + winW * 1.3, downY + winH * 1.2], [dwx, downY + winH * 1.2]], true, 0.5))
    const doorX = left + hw * 0.66
    const doorW = hw * 0.2
    const doorTop = base - hh * 0.4
    ink.push(outline(r, [[doorX, base], [doorX, doorTop], [doorX + doorW, doorTop], [doorX + doorW, base]], false, 0.5))
    if (washes) {
      const doorColour = [SAGE, BRICK, SLATE, '#7A1F1F'][Math.floor(r() * 4)]
      fills.push({ d: wash(r, [[doorX, base], [doorX, doorTop], [doorX + doorW, doorTop], [doorX + doorW, base]], 0.8), fill: doorColour, opacity: 0.45 })
    }
    ink.push(stroke(r, doorX - 3, base - 2, doorX + doorW + 3, base - 2, 0.3))

    cx = right
  }
  ink.push(stroke(r, x - 10, base, cx + 10, base, 0.6))
  return { ink, washes: fills, blocks, windows, pots, width: cx - x }
}
