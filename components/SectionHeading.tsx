import { Eyebrow } from './Eyebrow'

// Standard page and section heading. Eyebrow running head, serif title, optional
// intro paragraph in the reading column. See docs/DESIGN.md.
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
  const Tag = as
  return (
    <div className="max-w-reading">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag
        className={`font-serif ${as === 'h1' ? 'text-h1' : 'text-h2'} ${
          eyebrow ? 'mt-4' : ''
        }`}
      >
        {title}
      </Tag>
      {intro && (
        <p className="font-serif text-body-lg text-ink-soft mt-4">{intro}</p>
      )}
    </div>
  )
}
