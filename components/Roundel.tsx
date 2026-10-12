// The official Charlie Rogers logo: the distressed stamp with his name, his
// years and the sketched dog, supplied by Brian Rankin in October 2026. The
// artwork is a transparent PNG used as a mask, so the logo takes the text
// colour of whatever it sits on, as the drawn roundel it replaces did. The
// circle is the stamp's own shape, not a softened corner, so the square
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
  const colour =
    tone === 'paper' ? 'bg-paper' : tone === 'ink' ? 'bg-ink' : 'bg-bensham'
  const mask = 'url(/brand/charlie-rogers-logo.png) center / contain no-repeat'
  return (
    <span
      className={`inline-block shrink-0 ${colour} ${className}`}
      style={{ width: size, height: size, mask, WebkitMask: mask }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    />
  )
}
