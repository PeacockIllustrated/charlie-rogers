import type { Status } from '@/lib/content/types'

// The race line: the site's signature device. One axis, 1964 to 2020, the span
// of Charlie's painting life. An ink mark for each dated painting of a place;
// what happens after the last mark says what became of it.
//   demolished  a Bensham red line runs from the painting to the year it came
//               down, ending in a tick. With the year unconfirmed the line is
//               dashed and runs off the end with no tick, saying gone without
//               claiming when.
//   altered     an ochre dashed line from the last painting to the present.
//   extant      a sage line from the last painting to the present.
// Marks are square, like every status marker on the site.

const START = 1964
const END = 2020

function x(year: number): number {
  const clamped = Math.min(Math.max(year, START), END)
  return ((clamped - START) / (END - START)) * 100
}

const tail: Record<Status, string> = {
  demolished: 'border-bensham',
  altered: 'border-ochre border-dashed',
  extant: 'border-sage',
  unknown: 'border-ink-mute border-dotted',
}

function summary(painted: number[], status: Status, cleared?: number): string {
  const p = painted.length
    ? `Painted ${painted.join(', ')}`
    : 'Year painted not recorded'
  const fate =
    status === 'demolished'
      ? cleared
        ? `demolished ${cleared}`
        : 'demolished, year not yet confirmed'
      : status === 'altered'
        ? 'since altered'
        : status === 'extant'
          ? 'still standing'
          : 'fate unknown'
  return `${p}; ${fate}.`
}

export function RaceLine({
  painted,
  status,
  cleared,
  size = 'default',
  className = '',
}: {
  painted: number[]
  status: Status
  cleared?: number
  size?: 'default' | 'large'
  className?: string
}) {
  const years = [...new Set(painted)].sort((a, b) => a - b)
  const last = years.at(-1)
  const label = summary(years, status, cleared)

  // Where the tail starts and stops, as percentages of the axis.
  const from = last !== undefined ? x(last) : 0
  const to = status === 'demolished' && cleared ? x(cleared) : 100
  const large = size === 'large'

  return (
    <figure className={className}>
      {/* The drawing repeats the caption, so it is hidden from screen readers. */}
      <div aria-hidden="true" className={large ? 'relative h-10' : 'relative h-6'}>
        {/* The axis */}
        <div className="absolute inset-x-0 top-1/2 border-t border-rule" />
        {/* Year ticks at each decade */}
        {[1970, 1980, 1990, 2000, 2010].map((d) => (
          <div
            key={d}
            className="absolute top-1/2 h-1.5 -translate-y-1/2 border-l border-rule"
            style={{ left: `${x(d)}%` }}
          />
        ))}
        {/* What became of it */}
        {(last !== undefined || status !== 'unknown') && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 border-t-2 ${tail[status]} ${
              status === 'demolished' && !cleared ? 'border-dashed' : ''
            }`}
            style={{ left: `${from}%`, width: `${Math.max(to - from, 0)}%` }}
          />
        )}
        {status === 'demolished' && cleared && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 border-l-2 border-bensham ${large ? 'h-6' : 'h-4'}`}
            style={{ left: `${x(cleared)}%` }}
          />
        )}
        {/* Paintings */}
        {years.map((y) => (
          <div
            key={y}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink ${large ? 'h-2.5 w-2.5' : 'h-2 w-2'}`}
            style={{ left: `${x(y)}%` }}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 flex items-baseline justify-between gap-4 font-sans text-xs text-ink-mute">
        <span aria-hidden="true">{START}</span>
        <span className="text-center text-ink-soft">{label}</span>
        <span aria-hidden="true">{END}</span>
      </figcaption>
    </figure>
  )
}
