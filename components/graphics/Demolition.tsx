import { rng, stroke, outline, wash, terrace, type House, type Range } from '@/lib/sketch'
import { InkDefs, Smoke } from './Ink'

// The race, drawn. A terrace stands across the frame; a bulldozer works along
// it from the left, knocking each house down in turn into dust and rubble. At the far end a man in a flat cap stands at his easel, painting
// the last of the row before it goes. Then the street is drawn again and the
// race restarts. This is the book's whole argument in one moving line.

const W = 1200
const H = 230
const BASE = 200

function Bulldozer({ r }: { r: () => number }) {
  // Drawn facing right, origin at the back of the tracks on the ground.
  const ink = [
    // tracks
    `M4 ${BASE - 2}Q0 ${BASE - 10} 6 ${BASE - 17}L86 ${BASE - 17}Q94 ${BASE - 10} 88 ${BASE - 2}Z`,
    outline(r, [[8, BASE - 17], [8, BASE - 40], [62, BASE - 40], [62, BASE - 17]], false, 0.6),
    // cab
    outline(r, [[14, BASE - 40], [18, BASE - 66], [46, BASE - 66], [50, BASE - 40]], false, 0.6),
    outline(r, [[22, BASE - 44], [24, BASE - 61], [42, BASE - 61], [44, BASE - 44]], true, 0.4),
    // exhaust
    stroke(r, 56, BASE - 40, 56, BASE - 58, 0.3),
    // arm and blade
    stroke(r, 62, BASE - 30, 92, BASE - 24, 0.5),
    stroke(r, 62, BASE - 22, 92, BASE - 16, 0.5),
    `M92 ${BASE - 40}Q101 ${BASE - 20} 92 ${BASE}`,
    stroke(r, 92, BASE - 40, 98, BASE - 40, 0.3),
    stroke(r, 92, BASE, 99, BASE, 0.3),
  ]
  const wheels = [16, 32, 48, 64, 78].map((cx) => (
    <circle key={cx} cx={cx} cy={BASE - 9} r={5} fill="none" stroke="#1A1916" strokeWidth={1} />
  ))
  return (
    <>
      <path d={wash(r, [[8, BASE - 18], [8, BASE - 40], [62, BASE - 40], [62, BASE - 18]], 2)} fill="#B8842C" opacity={0.55} />
      <path d={wash(r, [[16, BASE - 40], [19, BASE - 65], [45, BASE - 65], [49, BASE - 40]], 2)} fill="#B8842C" opacity={0.45} />
      <path d={`M92 ${BASE - 40}Q101 ${BASE - 20} 92 ${BASE}L88 ${BASE}Q96 ${BASE - 20} 88 ${BASE - 40}Z`} fill="#44423D" opacity={0.5} />
      {ink.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#1A1916" strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {wheels}
    </>
  )
}

function Painter({ r, x }: { r: () => number; x: number }) {
  // Easel to the left of the man, canvas facing him, so he looks back down
  // the street at what he is painting.
  const ink = [
    // easel
    stroke(r, x, BASE, x + 10, BASE - 62, 0.4),
    stroke(r, x + 22, BASE, x + 12, BASE - 62, 0.4),
    stroke(r, x + 11, BASE - 62, x + 13, BASE, 0.4),
    outline(r, [[x - 2, BASE - 66], [x + 24, BASE - 66], [x + 24, BASE - 40], [x - 2, BASE - 40]], true, 0.4),
    // figure: legs, coat, arm to the canvas, head and flat cap
    stroke(r, x + 40, BASE, x + 43, BASE - 30, 0.4),
    stroke(r, x + 50, BASE, x + 47, BASE - 30, 0.4),
    outline(r, [[x + 38, BASE - 28], [x + 40, BASE - 58], [x + 52, BASE - 58], [x + 54, BASE - 28]], true, 0.5),
    stroke(r, x + 40, BASE - 52, x + 25, BASE - 48, 0.4),
    `M${x + 46} ${BASE - 62}m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`,
    `M${x + 38} ${BASE - 66}Q${x + 46} ${BASE - 73} ${x + 55} ${BASE - 66}L${x + 36} ${BASE - 66}`,
  ]
  return (
    <g className="painter">
      <path d={wash(r, [[x + 38, BASE - 28], [x + 40, BASE - 58], [x + 52, BASE - 58], [x + 54, BASE - 28]], 1.5)} fill="#4A5B6E" opacity={0.5} />
      <path d={wash(r, [[x - 1, BASE - 65], [x + 23, BASE - 65], [x + 23, BASE - 41], [x - 1, BASE - 41]], 1)} fill="#F2EBDC" opacity={1} />
      {/* The painting on the easel: a tiny row of roofs */}
      <path d={`M${x + 1} ${BASE - 46}L${x + 5} ${BASE - 52}L${x + 10} ${BASE - 49}L${x + 15} ${BASE - 54}L${x + 21} ${BASE - 48}`} fill="none" stroke="#A85842" strokeWidth={1.4} className="painter-brush" />
      {ink.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#1A1916" strokeWidth={1.1} strokeLinecap="round" />
      ))}
      <g className="painter-arm">
        <path d={stroke(r, x + 40, BASE - 50, x + 24, BASE - 50, 0.3)} fill="none" stroke="#1A1916" strokeWidth={1.1} />
      </g>
    </g>
  )
}

const CYCLE = 30
const pc = (n: number) => `${Math.round(n * 100) / 100}%`

type Plan = { arrive: number[]; dozer: string }

// The choreography, worked out from where each house actually stands. The
// bulldozer drives up to a house, shoves, and the house shakes, loses its
// chimney, then folds away from the blade into a cloud of brick dust and a
// heap of rubble. It reverses a touch, drives on to the next. After the last
// house it rolls off, the street is drawn up again, and the race restarts.
function plan(lefts: number[], last: number): Plan {
  const n = lefts.length
  const first = 6
  const step = (84 - first) / n
  const arrive = lefts.map((_, i) => first + i * step)
  const T0 = -110
  const at = (left: number) => left - 98
  const frames: [number, number, number][] = [[0, T0, 0]]
  arrive.forEach((a, i) => {
    const t = at(lefts[i])
    frames.push([a, t, 0])
    frames.push([a + 0.8, t + 6, -1.6])
    frames.push([a + 2.2, t + 3, 0])
    frames.push([a + step * 0.62, t + 1, 0])
  })
  frames.push([88, at(last) + 60, 0])
  frames.push([100, at(last) + 60, 0])
  const body = frames
    .map(([p, x, rot]) => `${pc(p)}{transform:translateX(${Math.round(x)}px) rotate(${rot}deg)}`)
    .join('')
  return { arrive, dozer: body }
}

function choreography(id: string, houses: House[], last: number): string {
  const { arrive, dozer } = plan(
    houses.map((h) => h.left),
    last,
  )
  const k = (name: string) => `${id}-${name}`
  const css: string[] = []
  css.push(`@keyframes ${k('dz')}{${dozer}}`)
  css.push(`@keyframes ${k('dzf')}{0%{opacity:0}2%{opacity:1}89%{opacity:1}94%,100%{opacity:0}}`)
  css.push(`.${id} .dz{animation:${k('dz')} ${CYCLE}s linear infinite,${k('dzf')} ${CYCLE}s linear infinite}`)
  arrive.forEach((a, i) => {
    css.push(
      `@keyframes ${k(`h${i}`)}{0%,${pc(a)}{transform:none;opacity:1}${pc(a + 0.6)}{transform:translateX(1.6px)}${pc(a + 1.2)}{transform:translateX(-1.6px) rotate(-0.4deg)}${pc(a + 1.9)}{transform:translateX(1.2px) rotate(0.8deg);opacity:1}${pc(a + 4.6)}{transform:translate(12px,8px) rotate(10deg) scaleY(0.2);opacity:0}95.9%{transform:translate(12px,8px) rotate(10deg) scaleY(0.2);opacity:0}96%{transform:none;opacity:0}99.5%,100%{transform:none;opacity:1}}`,
    )
    css.push(
      `@keyframes ${k(`c${i}`)}{0%,${pc(a + 0.5)}{transform:none;opacity:1}${pc(a + 2.8)}{transform:translate(18px,34px) rotate(80deg);opacity:0}95.9%{transform:translate(18px,34px) rotate(80deg);opacity:0}96%{transform:none;opacity:0}99.5%,100%{transform:none;opacity:1}}`,
    )
    css.push(
      `@keyframes ${k(`d${i}`)}{0%,${pc(a + 1.4)}{transform:scale(0.3);opacity:0}${pc(a + 2.6)}{transform:scale(1);opacity:0.75}${pc(a + 10)}{transform:translateY(-16px) scale(2.4);opacity:0}100%{transform:scale(0.3);opacity:0}}`,
    )
    css.push(
      `@keyframes ${k(`m${i}`)}{0%,${pc(a + 2.6)}{transform:scaleY(0);opacity:1}${pc(a + 5.5)}{transform:scaleY(1);opacity:1}95%{transform:scaleY(1);opacity:1}97.5%,100%{transform:scaleY(0.6);opacity:0}}`,
    )
    css.push(`.${id} .h${i}{animation:${k(`h${i}`)} ${CYCLE}s linear infinite}`)
    css.push(`.${id} .c${i}{animation:${k(`c${i}`)} ${CYCLE}s linear infinite}`)
    css.push(`.${id} .d${i}{animation:${k(`d${i}`)} ${CYCLE}s ease-out infinite}`)
    css.push(`.${id} .m${i}{animation:${k(`m${i}`)} ${CYCLE}s ease-out infinite}`)
    bricksFor(houses[i], i).forEach((br, b) => {
      const land = `translate(${Math.round(br.dx)}px,${Math.round(br.land)}px) rotate(${Math.round(br.rot * 2)}deg)`
      css.push(
        `@keyframes ${k(`b${i}-${b}`)}{0%,${pc(a + 1.8)}{transform:none;opacity:0}${pc(a + 2)}{opacity:1}${pc(a + 3.2)}{transform:translate(${Math.round(br.dx * 0.55)}px,-${Math.round(br.up)}px) rotate(${Math.round(br.rot)}deg)}${pc(a + 4.6)}{transform:${land};opacity:1}${pc(a + 11)}{transform:${land};opacity:1}${pc(a + 13)},100%{transform:${land};opacity:0}}`,
      )
      css.push(`.${id} .b${i}-${b}{animation:${k(`b${i}-${b}`)} ${CYCLE}s cubic-bezier(.3,.6,.6,1) infinite}`)
    })
  })
  // At rest, for readers who ask for less motion: half the street gone, the
  // bulldozer at the next house, rubble where the first houses stood.
  const half = Math.floor(houses.length / 2)
  const rest: string[] = [`.${id} *{animation:none!important}`, `.${id} .dz{transform:translateX(${Math.round(houses[half].left - 98)}px)}`]
  for (let i = 0; i < houses.length; i++) {
    if (i < half) rest.push(`.${id} .h${i},.${id} .c${i}{opacity:0}.${id} .m${i}{transform:scaleY(1)}`)
    else rest.push(`.${id} .m${i}{transform:scaleY(0)}`)
    rest.push(`.${id} .d${i},.${id} [class^="b${i}-"]{opacity:0}`)
  }
  css.push(`@media (prefers-reduced-motion:reduce){${rest.join('')}}`)
  return css.join('')
}

const BRICKS = 7

type Brick = { x: number; y: number; w: number; dx: number; up: number; land: number; rot: number }

// Where each brick starts in the wall and where it lands, worked out once so
// the drawing and its animation agree. Bricks land on the heap, not in mid air.
function bricksFor(h: House, i: number): Brick[] {
  return Array.from({ length: BRICKS }, (_, b) => {
    const r = rng(i * 97 + b)
    const x = h.left + 8 + r() * (h.right - h.left - 16)
    const y = h.ridge + 20 + r() * (BASE - h.ridge - 40)
    const dx = 8 + r() * 40
    return {
      x,
      y,
      w: 6 + r() * 3,
      dx,
      up: 14 + r() * 30,
      land: BASE - y - 4 - r() * 14,
      rot: (r() - 0.5) * 300,
    }
  })
}

export function Demolition({ id = 'demo', className = '' }: { id?: string; className?: string }) {
  const r = rng(1964)
  const street = terrace(1965, { x: 20, base: BASE, count: 12, w: [72, 86], h: [78, 104] })
  const lastRight = street.houses[street.houses.length - 1].right
  const scope = `demo-${id}`
  const css = choreography(scope, street.houses, lastRight)
  const slice = <T,>(arr: T[], [a, b]: Range) => arr.slice(a, b)
  const minus = (arr: string[], whole: Range, part: Range) => [...arr.slice(whole[0], part[0]), ...arr.slice(part[1], whole[1])]

  return (
    <svg
      viewBox={`0 42 ${W} ${H - 37}`}
      className={`${scope} block h-auto w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <style>{css}</style>
      <InkDefs id={id} />

      {/* Rubble heaps, one per house, raised as each house comes down */}
      <g filter={`url(#${id}-wash)`}>
        {street.houses.map((h, i) => {
          const w = h.right - h.left
          const hr = rng(i + 500)
          const peak = h.left + w * (0.45 + hr() * 0.3)
          const height = 16 + hr() * 12
          return (
            <g key={i} className={`m${i}`} style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
              <path
                d={`M${h.left - 6} ${BASE}Q${h.left + w * 0.2} ${BASE - height * 0.6} ${peak} ${BASE - height}Q${h.right - w * 0.15} ${BASE - height * 0.7} ${h.right + 14} ${BASE}Z`}
                fill="#A85842"
                opacity={0.42}
              />
              <path
                d={`M${h.left + 4} ${BASE}Q${peak - 6} ${BASE - height * 0.55} ${h.right + 6} ${BASE}Z`}
                fill="#44423D"
                opacity={0.18}
              />
              {Array.from({ length: 6 }, (_, b) => {
                const bx = h.left + 6 + hr() * (w - 6)
                const by = BASE - 3 - hr() * height * 0.6
                return (
                  <path
                    key={b}
                    d={outline(hr, [[bx, by], [bx + 7, by - 1], [bx + 7.5, by + 3], [bx + 0.5, by + 4]], true, 0.3)}
                    fill="#A85842"
                    stroke="#1A1916"
                    strokeWidth={0.7}
                  />
                )
              })}
              {/* a timber end sticking out of the heap */}
              <path d={stroke(hr, peak - 10, BASE - height * 0.5, peak + 14, BASE - height - 6, 0.4)} stroke="#1A1916" strokeWidth={1.2} fill="none" />
            </g>
          )
        })}
      </g>

      {/* The houses, each on its own so each can fall */}
      {street.houses.map((h, i) => (
        <g key={i}>
          <g className={`h${i}`} style={{ transformBox: 'fill-box', transformOrigin: 'right bottom' }}>
            <g filter={`url(#${id}-wash)`}>
              {slice(street.washes, h.wash)
                .filter((_, j) => j + h.wash[0] < h.stackWash[0] || j + h.wash[0] >= h.stackWash[1])
                .map((sh, j) => (
                  <path key={j} d={sh.d} fill={sh.fill} opacity={sh.opacity} />
                ))}
            </g>
            <g filter={`url(#${id}-ink)`} fill="none" stroke="#1A1916" strokeWidth={1.1} strokeLinecap="round">
              {minus(street.ink, h.ink, h.stackInk).map((d, j) => (
                <path key={j} d={d} />
              ))}
            </g>
          </g>
          <g className={`c${i}`} style={{ transformBox: 'fill-box', transformOrigin: 'left bottom' }}>
            {slice(street.washes, h.stackWash).map((sh, j) => (
              <path key={j} d={sh.d} fill={sh.fill} opacity={sh.opacity} />
            ))}
            <g filter={`url(#${id}-ink)`} fill="none" stroke="#1A1916" strokeWidth={1.1} strokeLinecap="round">
              {slice(street.ink, h.stackInk).map((d, j) => (
                <path key={j} d={d} />
              ))}
            </g>
            {i % 3 === 1 && <Smoke x={h.right - 3} y={h.stackTop - 6} filter={`${id}-smoke`} delay={i * 0.8} />}
          </g>
          {/* flying bricks */}
          {bricksFor(h, i).map((br, b) => (
            <rect
              key={b}
              className={`b${i}-${b}`}
              x={br.x}
              y={br.y}
              width={br.w}
              height={3.5}
              fill="#A85842"
              stroke="#1A1916"
              strokeWidth={0.6}
              style={{ transformBox: 'fill-box', transformOrigin: 'center', opacity: 0 }}
            />
          ))}
          {/* the cloud of brick dust */}
          <g className={`d${i}`} filter={`url(#${id}-smoke)`} style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', opacity: 0 }}>
            {Array.from({ length: 7 }, (_, c) => {
              const cr = rng(i * 13 + c)
              return (
                <circle
                  key={c}
                  cx={h.left + cr() * (h.right - h.left)}
                  cy={BASE - 10 - cr() * 50}
                  r={12 + cr() * 16}
                  fill={c % 3 === 0 ? '#A85842' : '#9A9384'}
                  opacity={0.55}
                />
              )
            })}
          </g>
        </g>
      ))}

      <g className="dz" style={{ transformBox: 'view-box', transformOrigin: '98px 200px' }}>
        <g className="dz-rumble">
          <g filter={`url(#${id}-ink)`}>
            <Bulldozer r={r} />
          </g>
        </g>
        <Smoke x={56} y={BASE - 60} filter={`${id}-smoke`} />
      </g>

      <g filter={`url(#${id}-ink)`}>
        <Painter r={r} x={1080} />
      </g>
      <path d={stroke(r, 0, BASE, W, BASE, 0.5)} fill="none" stroke="#1A1916" strokeWidth={1} />
    </svg>
  )
}
