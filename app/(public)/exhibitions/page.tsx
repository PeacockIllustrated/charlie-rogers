import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { BookCallout } from '@/components/BookCallout'
import { exhibitions } from '@/lib/content/exhibitions'
import type { Exhibition } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Exhibitions',
  description:
    'Selected exhibitions from the career of Gateshead painter Charlie Rogers, including four showings at the Royal Academy Summer Exhibition.',
}

function ExhibitionRow({ exhibition }: { exhibition: Exhibition }) {
  return (
    <div className="flex gap-6 border-t border-rule py-4">
      <div className="w-24 shrink-0">
        <span className="font-sans text-small text-ink-mute tabular-nums">
          {exhibition.year}
        </span>
      </div>
      <div>
        <p className="font-serif text-h4 text-ink">{exhibition.name}</p>
        {(exhibition.venue || exhibition.city) && (
          <p className="font-serif text-body text-ink-soft mt-1">
            {[exhibition.venue, exhibition.city].filter(Boolean).join(', ')}
          </p>
        )}
        {exhibition.note && (
          <p className="font-serif text-body text-ink-soft mt-1">
            {exhibition.note}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ExhibitionsPage() {
  const royalAcademy = exhibitions.filter((e) => e.royalAcademy)
  const lifetime = exhibitions.filter((e) => !e.royalAcademy && !e.posthumous)
  const posthumous = exhibitions.filter((e) => e.posthumous)

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Exhibitions"
        intro="Over fifty lifetime exhibitions, including four showings at the Royal Academy Summer Exhibition and a posthumous programme that continues today."
      />

      <section className="mt-12 max-w-reading" aria-labelledby="ra-heading">
        <Eyebrow rule={false} className="mb-4">
          Royal Academy
        </Eyebrow>
        <ol aria-labelledby="ra-heading">
          {royalAcademy.map((exhibition) => (
            <li key={`${exhibition.year}-${exhibition.name}`}>
              <ExhibitionRow exhibition={exhibition} />
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-12 max-w-reading"
        aria-labelledby="lifetime-heading"
      >
        <Eyebrow rule={false} className="mb-4">
          Selected lifetime exhibitions
        </Eyebrow>
        <ol aria-labelledby="lifetime-heading">
          {lifetime.map((exhibition) => (
            <li key={`${exhibition.year}-${exhibition.name}`}>
              <ExhibitionRow exhibition={exhibition} />
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-12 max-w-reading"
        aria-labelledby="posthumous-heading"
      >
        <Eyebrow rule={false} className="mb-4">
          Posthumous
        </Eyebrow>
        <ol aria-labelledby="posthumous-heading">
          {posthumous.map((exhibition) => (
            <li key={`${exhibition.year}-${exhibition.name}`}>
              <ExhibitionRow exhibition={exhibition} />
            </li>
          ))}
        </ol>
      </section>

      <BookCallout text="The complete exhibition chronology is in the book." />
    </div>
  )
}
