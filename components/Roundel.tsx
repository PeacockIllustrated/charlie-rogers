// The official Charlie Rogers emblem, supplied as SVG in October 2026: his
// name, his years and the sketched dog. Two versions are drawn: the light one
// (red on paper) for paper backgrounds and the dark one (white on red) for the
// red blocks. The circle is the emblem's own shape, not a softened corner, so
// the square corners rule stands.
export function Roundel({
  size = 160,
  className = '',
  tone = 'bensham',
  title,
}: {
  size?: number
  className?: string
  // 'paper' sits on a red background; 'bensham' and 'ink' sit on paper.
  tone?: 'bensham' | 'paper' | 'ink'
  title?: string
}) {
  const src = tone === 'paper' ? '/brand/emblem-dark.svg' : '/brand/emblem-light.svg'
  return (
    // A static SVG at a fixed size gains nothing from next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      className={`inline-block shrink-0 ${className}`}
    />
  )
}
