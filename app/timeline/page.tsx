import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { BookCallout } from '@/components/BookCallout'
import { timeline } from '@/lib/content/timeline'

export const metadata: Metadata = {
  title: 'Timeline',
  description:
    'Key dates in the life of Gateshead painter Charlie Rogers, from his birth in 1930 to the posthumous exhibitions that followed his death in 2020.',
}

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Timeline"
        intro="Fifty-six years of painting, from a convalescent week in Bensham to one of the great bodies of work in Northern English art."
      />

      <ol className="mt-12 max-w-reading" aria-label="Timeline of key events">
        {timeline.map((event) => (
          <li key={`${event.year}-${event.title}`}>
            <div className="flex gap-6 border-t border-rule py-4">
              <div className="w-12 shrink-0">
                <span className="font-sans text-small text-ink-mute tabular-nums">
                  {event.year}
                </span>
              </div>
              <div>
                <p className="font-serif text-h4 text-ink">{event.title}</p>
                {event.body && (
                  <p className="font-serif text-body text-ink-soft mt-1">
                    {event.body}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <BookCallout text="The full chronology, year by year, is in the book." />
    </div>
  )
}
