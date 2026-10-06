import { rng, stroke, outline, wash, terrace } from '@/lib/sketch'
import { InkDefs, Smoke } from './Ink'

// The race, drawn. A terrace stands across the frame; a bulldozer works along
// it from the left and the houses come down behind its blade, leaving brick
// rubble. At the far end a man in a flat cap stands at his easel, painting
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

function Rubble({ r }: { r: () => number }) {
  const mounds: string[] = []
  const bricks: string[] = []
  for (let x = 10; x < 1000; x += 38 + r() * 30) {
    const w = 60 + r() * 50
    const h = 10 + r() * 14
    mounds.push(`M${x} ${BASE}Q${x + w * 0.3} ${BASE - h} ${x + w * 0.55} ${BASE - h * 0.8}Q${x + w * 0.8} ${BASE - h * 0.5} ${x + w} ${BASE}Z`)
    for (let b = 0; b < 4; b++) {
      const bx = x + r() * w
      const by = BASE - 2 - r() * h * 0.7
      bricks.push(outline(r, [[bx, by], [bx + 6, by - 1], [bx + 6.5, by + 2.5], [bx + 0.5, by + 3.5]], true, 0.3))
    }
  }
  return (
    <g>
      {mounds.map((d, i) => (
        <path key={i} d={d} fill="#A85842" opacity={0.2} />
      ))}
      {bricks.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#44423D" strokeWidth={0.8} />
      ))}
    </g>
  )
}

export function Demolition({ id = 'demo', className = '' }: { id?: string; className?: string }) {
  const r = rng(1964)
  const street = terrace(1965, { x: 20, base: BASE, count: 12, w: [72, 86], h: [78, 104] })
  return (
    <svg
      viewBox={`0 42 ${W} ${H - 37}`}
      className={`block h-auto w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <InkDefs id={id} />
      <clipPath id={`${id}-standing`}>
        {/* Everything to the right of the blade still stands */}
        <rect className="demo-clip" x={98} y={0} width={W + 400} height={H} />
      </clipPath>

      <g filter={`url(#${id}-wash)`}>
        <Rubble r={r} />
      </g>

      <g clipPath={`url(#${id}-standing)`} className="demo-street">
        <g filter={`url(#${id}-wash)`}>
          {street.washes.map((s, i) => (
            <path key={i} d={s.d} fill={s.fill} opacity={s.opacity} />
          ))}
        </g>
        <g filter={`url(#${id}-ink)`} fill="none" stroke="#1A1916" strokeWidth={1.1} strokeLinecap="round">
          {street.ink.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {street.pots
          .filter((_, i) => i % 4 === 1)
          .map(([x, y], i) => (
            <Smoke key={i} x={x} y={y} filter={`${id}-smoke`} delay={i * 0.9} />
          ))}
      </g>

      <g className="demo-dozer">
        <g filter={`url(#${id}-ink)`}>
          <Bulldozer r={r} />
        </g>
        <Smoke x={56} y={BASE - 60} filter={`${id}-smoke`} />
        {/* Dust thrown up at the blade */}
        <g filter={`url(#${id}-smoke)`}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={100} cy={BASE - 6} r={5} fill="#A85842" className="dust" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
      </g>

      <g filter={`url(#${id}-ink)`}>
        <Painter r={r} x={1080} />
      </g>
      <path d={stroke(r, 0, BASE, W, BASE, 0.5)} fill="none" stroke="#1A1916" strokeWidth={1} />
    </svg>
  )
}
