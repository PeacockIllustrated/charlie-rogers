import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { BookCallout } from '@/components/BookCallout'
import { exhibitions } from '@/lib/content/exhibitions'
import type { Exhibition } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Exhibitions',
  description:
    'Selected exhibitions from the career of Gateshead painter Charlie Rogers, including four showings at the Royal Academy Summer Exhibition.',
}

// The eyebrow rendered as a real heading carrying the id. The sections here
// referenced aria-labelledby ids that no element had, because Eyebrow renders
// an unlabelled span, so each section was announced with no name at all.
function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="mb-4 font-sans text-xs uppercase tracking-eyebrow text-bensham"
    >
      {children}
    </h2>
  )
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
        <SectionLabel id="ra-heading">Royal Academy</SectionLabel>
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
        <SectionLabel id="lifetime-heading">Selected lifetime exhibitions</SectionLabel>
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
        <SectionLabel id="posthumous-heading">Posthumous</SectionLabel>
        <ol aria-labelledby="posthumous-heading">
          {posthumous.map((exhibition) => (
            <li key={`${exhibition.year}-${exhibition.name}`}>
              <ExhibitionRow exhibition={exhibition} />
            </li>
          ))}
        </ol>
      </section>

      {/* Brian Rankin offers these and asked for them on the site, 12 June 2026.
          His wording: "Charlie Rogers Talks personally presented by Brian
          Rankin. Ask for details." Deliberately no link: the site has no
          contact page or address to send an enquiry to yet, and inventing one
          would be worse than leaving his "ask for details" as written. */}
      <section className="mt-16 max-w-reading" aria-labelledby="talks-heading">
        <SectionLabel id="talks-heading">Talks</SectionLabel>
        <p className="font-serif text-h4 text-ink">
          Charlie Rogers talks, presented by Brian Rankin
        </p>
        <p className="mt-2 font-serif text-body text-ink-soft">
          Talks on Charlie Rogers and the story behind the paintings are
          available to schools, art groups and other organisations, presented in
          person by Brian Rankin, who compiled Pursued by Bulldozers.
        </p>
        <p className="mt-4 font-sans text-small text-ink-mute">
          Ask for details.
        </p>
      </section>

      <BookCallout text="The complete exhibition chronology is in the book." />
    </div>
  )
}
