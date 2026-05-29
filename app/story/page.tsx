import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { Prose } from '@/components/Prose'
import { BookCallout } from '@/components/BookCallout'
import { storySections, storyIntro } from '@/lib/content/story'

export const metadata: Metadata = {
  title: 'The story',
  description:
    'How a football injury in 1964 set a Gateshead man on a 56-year mission to paint his home town before the bulldozers took it.',
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

      {storySections.map((section) => (
        <section key={section.slug} className="mt-12">
          <h2 className="font-serif text-h2 max-w-reading">{section.title}</h2>

          <div className="mt-4">
            <Prose paragraphs={section.paragraphs} />
          </div>

          {section.quote && (
            <figure className="mt-8 max-w-reading">
              <blockquote className="font-serif italic text-h3 text-bensham">
                {section.quote.text}
              </blockquote>
              <figcaption className="font-sans text-small text-ink-mute mt-3">
                {section.quote.source}
              </figcaption>
            </figure>
          )}
        </section>
      ))}

      <BookCallout />
    </div>
  )
}
