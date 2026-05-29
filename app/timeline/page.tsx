import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { BookCallout } from '@/components/BookCallout'
import {
  timelineEras,
  eventsByEra,
  kindLabels,
  kindDotClass,
  type TimelineEvent,
  type TimelineEventKind,
} from '@/lib/content/timeline'

export const metadata: Metadata = {
  title: 'Timeline',
  description:
    'The life of Charlie Rogers in four chapters, from a Gateshead childhood to the Royal Academy and the campaign for his legacy.',
}

const kindOrder: TimelineEventKind[] = ['life', 'work', 'family', 'exhibition']

function Marker({ event }: { event: TimelineEvent }) {
  // Solid square node sitting on the spine. Pivotal moments are larger and red.
  const size = event.pivotal ? 'h-3.5 w-3.5 -left-[7px]' : 'h-2.5 w-2.5 -left-[5px]'
  const colour = event.pivotal ? 'bg-bensham' : kindDotClass[event.kind]
  return <span className={`absolute top-1.5 ${size} ${colour}`} aria-hidden="true" />
}

function Event({ event }: { event: TimelineEvent }) {
  return (
    <li className="grid grid-cols-[3.5rem_1fr] gap-x-4 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6">
      <div className="pt-0.5 text-right">
        <span className="font-sans text-small tabular-nums text-ink-mute">
          {event.year}
        </span>
      </div>

      <div className="relative border-l border-rule pb-12 pl-6 sm:pl-8">
        <Marker event={event} />

        <h3
          className={`font-serif ${
            event.pivotal ? 'text-h3 text-bensham' : 'text-h4'
          }`}
        >
          {event.title}
        </h3>

        {event.body && (
          <p className="mt-2 max-w-reading font-serif text-body text-ink-soft">
            {event.body}
          </p>
        )}

        {event.image && (
          <figure className="mt-5 max-w-md">
            <div className="bg-paper-warm p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt={event.imageAlt ?? event.title}
                loading="lazy"
                className="block h-auto w-full"
              />
            </div>
            {event.imageCaption && (
              <figcaption className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                {event.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {event.quote && (
          <figure className="mt-5 max-w-reading border-l-2 border-bensham pl-4">
            <blockquote className="font-serif italic text-body-lg text-ink">
              {event.quote.text}
            </blockquote>
            <figcaption className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              {event.quote.source}
            </figcaption>
          </figure>
        )}
      </div>
    </li>
  )
}

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Timeline"
        intro="Fifty-six years of painting, told in four chapters: the life before the brush, the lucky break that started it, the working years, and the legacy still being written."
      />

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-6">
        {kindOrder.map((kind) => (
          <div key={kind} className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 ${kindDotClass[kind]}`}
              aria-hidden="true"
            />
            <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
              {kindLabels[kind]}
            </dt>
          </div>
        ))}
      </dl>

      {timelineEras.map((era) => {
        const events = eventsByEra(era.slug)
        if (events.length === 0) return null
        return (
          <section key={era.slug} className="mt-16">
            <header className="max-w-reading">
              <Eyebrow>{era.range}</Eyebrow>
              <h2 className="mt-3 font-serif text-h2">{era.label}</h2>
              <p className="mt-3 font-serif text-body-lg text-ink-soft">
                {era.blurb}
              </p>
            </header>

            <ol className="mt-8">
              {events.map((event) => (
                <Event key={`${event.year}-${event.title}`} event={event} />
              ))}
            </ol>
          </section>
        )
      })}

      <BookCallout text="The full chronology, year by year, is in the book." />
    </div>
  )
}
