import { useId } from 'react'

// The mark, taken from the blind-embossed roundel on the cover of the special
// edition. The circle is the one deliberate curve on the site: it is the shape
// of the emboss itself, drawn as SVG, not a softened corner, so the square
// corners rule stands.
export function Roundel({
  size = 160,
  className = '',
  tone = 'bensham',
  title,
}: {
  size?: number
  className?: string
  tone?: 'bensham' | 'paper' | 'ink'
  title?: string
}) {
  const id = useId().replace(/:/g, '')
  const colour =
    tone === 'paper' ? 'text-paper' : tone === 'ink' ? 'text-ink' : 'text-bensham'
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`${colour} ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <path id={`r${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <text
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
      >
        {/* textLength fits the legend to the circumference exactly, so the
            last separator meets the first letter whatever font loads. */}
        <textPath href={`#r${id}`} startOffset="0" textLength="458" lengthAdjust="spacing">
          CHARLIE ROGERS · 1930 TO 2020 · GATESHEAD ·
        </textPath>
      </text>
      <text
        x="100"
        y="96"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontStyle: 'italic' }}
      >
        CR
      </text>
      <line x1="80" y1="112" x2="120" y2="112" stroke="currentColor" strokeWidth="0.75" />
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.2em' }}
      >
        PAINTER
      </text>
    </svg>
  )
}
