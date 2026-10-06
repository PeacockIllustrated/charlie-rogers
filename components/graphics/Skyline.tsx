import { terrace } from '@/lib/sketch'
import { Smoke } from './Ink'

// The footer's horizon: the terrace in silhouette against the evening, in the
// book's deep red, so every page ends looking up a Tyneside street. A few
// windows are lit and glow on and off as people come and go; the chimneys
// smoke.
export function Skyline({ id = 'sky', className = '' }: { id?: string; className?: string }) {
  const row = terrace(1930, { x: -10, base: 150, count: 18, w: [64, 82], h: [62, 92], washes: false })
  const lit = row.windows.filter((_, i) => (i * 7) % 5 === 1)
  return (
    <svg
      viewBox={`0 0 ${row.width - 20} 150`}
      preserveAspectRatio="xMidYMax slice"
      className={`-mb-px block h-[96px] w-full sm:h-[130px] ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`${id}-smoke`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {row.pots
        .filter((_, i) => i % 3 === 0)
        .map(([x, y], i) => (
          <Smoke key={i} x={x} y={y} filter={`${id}-smoke`} delay={i * 0.7} tone="ink" />
        ))}
      <g fill="#5E1414">
        {row.blocks.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {lit.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#B8842C" className="window-glow" style={{ animationDelay: `${(i * 1.7) % 9}s` }} />
      ))}
    </svg>
  )
}
