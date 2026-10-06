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
    <div className="flex gap-5 border-t border-rule px-5 py-4 sm:px-6">
      <div className="w-14 shrink-0 pt-0.5">
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

// A Royal Academy showing, one card each: the four are the peak of the
// record, so they stand apart from the long list.
function RaCard({ exhibition, n }: { exhibition: Exhibition; n: number }) {
  return (
    <div className="flex h-full flex-col border border-rule border-t-2 border-t-bensham bg-paper p-5 sm:p-6">
      <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
        {['First', 'Second', 'Third', 'Fourth', 'Fifth'][n] ?? ''} showing
      </p>
      <p className="mt-3 font-serif text-h1 text-bensham tabular-nums">{exhibition.year}</p>
      {exhibition.note && (
        <p className="mt-3 font-serif text-body text-ink">{exhibition.note}</p>
      )}
      <p className="mt-auto pt-4 font-sans text-xs text-ink-mute">{exhibition.name}</p>
    </div>
  )
}

export default function ExhibitionsPage() {
  const royalAcademy = exhibitions.filter((e) => e.royalAcademy)
  const lifetime = exhibitions.filter((e) => !e.royalAcademy && !e.posthumous)
  const posthumous = exhibitions.filter((e) => e.posthumous)

  return (
    <div className="pt-12">
      <div className="mx-auto max-w-content px-6">
        <SectionHeading
          as="h1"
          eyebrow="Charlie Rogers"
          title="Exhibitions"
          intro="Over fifty lifetime exhibitions, including four showings at the Royal Academy Summer Exhibition and a posthumous programme that continues today."
        />

        <section className="mt-12" aria-labelledby="ra-heading">
          <SectionLabel id="ra-heading">Royal Academy</SectionLabel>
          <ol aria-labelledby="ra-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {royalAcademy.map((exhibition, i) => (
              <li key={`${exhibition.year}-${exhibition.name}`}>
                <RaCard exhibition={exhibition} n={i} />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-16 border-y border-rule bg-paper-warm py-16 lg:py-20">
        <div className="mx-auto grid max-w-content items-start gap-8 px-6 lg:grid-cols-12">
          <section className="lg:col-span-7" aria-labelledby="lifetime-heading">
            <SectionLabel id="lifetime-heading">Selected lifetime exhibitions</SectionLabel>
            <ol aria-labelledby="lifetime-heading" className="border-x border-b border-rule bg-paper">
              {lifetime.map((exhibition) => (
                <li key={`${exhibition.year}-${exhibition.name}`}>
                  <ExhibitionRow exhibition={exhibition} />
                </li>
              ))}
            </ol>
          </section>

          <div className="space-y-8 lg:col-span-5">
            <section aria-labelledby="posthumous-heading">
              <SectionLabel id="posthumous-heading">Posthumous</SectionLabel>
              <ol aria-labelledby="posthumous-heading" className="border-x border-b border-rule bg-paper">
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
            <section
              className="border border-rule border-t-2 border-t-ink bg-paper p-5 sm:p-6"
              aria-labelledby="talks-heading"
            >
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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6">
        <BookCallout text="The complete exhibition chronology is in the book." />
      </div>
    </div>
  )
}
