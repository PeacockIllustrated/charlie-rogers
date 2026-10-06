// Shared SVG filters for the graphics. "ink" roughens a ruled line into a
// pen line with a slightly bleeding edge; "wash" softens colour the way
// watercolour pools on paper; "smoke" blurs a puff into a drifting haze.
export function InkDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
      <filter id={`${id}-wash`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" result="d" />
        <feGaussianBlur in="d" stdDeviation="0.6" />
      </filter>
      <filter id={`${id}-smoke`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
    </defs>
  )
}

// Smoke from a chimney pot: three puffs on a staggered loop, rising and
// drifting downwind as they thin out.
export function Smoke({
  x,
  y,
  filter,
  delay = 0,
  tone = 'ink',
}: {
  x: number
  y: number
  filter: string
  delay?: number
  tone?: 'ink' | 'paper'
}) {
  const fill = tone === 'paper' ? '#FAF6EE' : '#6B6860'
  return (
    <g filter={`url(#${filter})`} className="smoke">
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3.5}
          fill={fill}
          className="smoke-puff"
          style={{ animationDelay: `${delay + i * 2.1}s` }}
        />
      ))}
    </g>
  )
}
