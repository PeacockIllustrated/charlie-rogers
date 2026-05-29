// Long-form reading column. Optimum measure, serif body. See docs/DESIGN.md.
export function Prose({
  paragraphs,
  className = '',
}: {
  paragraphs: string[]
  className?: string
}) {
  return (
    <div
      className={`max-w-reading font-serif text-body-lg text-ink-soft space-y-5 ${className}`}
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}
