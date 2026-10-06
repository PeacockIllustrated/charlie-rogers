import { Eyebrow } from './Eyebrow'

// Page and section headings. A page title is set at display size with the
// running head above it and the introduction hung to the right, the way every
// main page opens. A section heading stays in the reading column.
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as = 'h2',
}: {
  eyebrow?: string
  title: string
  intro?: string
  as?: 'h1' | 'h2'
}) {
  if (as === 'h1') {
    return (
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {eyebrow && (
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              {eyebrow}
            </p>
          )}
          <h1 className={`font-serif text-display ${eyebrow ? 'mt-4' : ''}`}>{title}</h1>
        </div>
        {intro && (
          <p className="font-serif text-lead text-ink-soft lg:col-span-5 lg:self-end">
            {intro}
          </p>
        )}
      </header>
    )
  }
  return (
    <div className="max-w-reading">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={`font-serif text-h2 ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      {intro && <p className="mt-4 font-serif text-body text-ink-soft">{intro}</p>}
    </div>
  )
}
