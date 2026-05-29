import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { BookCallout } from '@/components/BookCallout'
import { storySections, storyIntro, type StorySection } from '@/lib/content/story'

export const metadata: Metadata = {
  title: 'The story',
  description:
    'How a football injury in 1964 set a Gateshead man on a 56-year mission to paint his home town before the bulldozers took it.',
}

function Chapter({
  section,
  number,
  flip,
}: {
  section: StorySection
  number: number
  flip: boolean
}) {
  return (
    <section className="border-t border-rule pt-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-start">
        {/* Text column */}
        <div className={flip ? 'lg:order-2' : ''}>
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-h2 text-rule tabular-nums">
              {String(number).padStart(2, '0')}
            </span>
            <div>
              <Eyebrow rule={false}>{section.period}</Eyebrow>
              <h2 className="font-serif text-h2 mt-1">{section.title}</h2>
            </div>
          </div>

          <div className="mt-5 font-serif text-body-lg text-ink-soft space-y-5">
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {section.quote && (
            <figure className="mt-8 border-l-2 border-bensham pl-5">
              <blockquote className="font-serif italic text-h4 text-bensham">
                {section.quote.text}
              </blockquote>
              <figcaption className="font-sans text-small text-ink-mute mt-3">
                {section.quote.source}
              </figcaption>
            </figure>
          )}
        </div>

        {/* Image column */}
        {section.image && (
          <figure className={flip ? 'lg:order-1' : ''}>
            <div className="bg-paper-warm p-4 lg:sticky lg:top-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image}
                alt={section.imageAlt ?? section.title}
                loading="lazy"
                className="block w-full h-auto"
              />
              {section.imageCaption && (
                <figcaption className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-3">
                  {section.imageCaption}
                </figcaption>
              )}
            </div>
          </figure>
        )}
      </div>
    </section>
  )
}

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="The story"
        intro={storyIntro}
      />

      <div className="mt-16 space-y-16">
        {storySections.map((section, i) => (
          <Chapter
            key={section.slug}
            section={section}
            number={i + 1}
            flip={i % 2 === 1}
          />
        ))}
      </div>

      <div className="mt-16">
        <BookCallout text="This is the short account. The full life, with more than a hundred paintings, is told in Charlie Rogers, Pursued by Bulldozers." />
      </div>
    </div>
  )
}
