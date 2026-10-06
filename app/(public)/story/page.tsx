import type { Metadata } from 'next'
import Link from 'next/link'
import { Plate } from '@/components/Plate'
import { imageInfo } from '@/lib/content/catalogue'
import { storySections, storyIntro, type StorySection } from '@/lib/content/story'

export const metadata: Metadata = {
  title: 'The story',
  description:
    'How a football injury in 1964 set a Gateshead man on a 56-year mission to paint his home town before the bulldozers took it.',
  alternates: { canonical: '/story' },
}

function Chapter({ section, number }: { section: StorySection; number: number }) {
  const info = section.image ? imageInfo(section.image) : undefined
  const entry = info?.entry
  return (
    <section className="border-t border-rule pt-6" aria-labelledby={`ch-${section.slug}`}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* The period hangs in the rail, as the book sets its chapter heads */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <p className="font-sans text-xs text-ink-mute">
              {String(number).padStart(2, '0')}
            </p>
            <p
              className="mt-2 font-serif text-h1 text-bensham"
              style={{ fontVariantNumeric: 'lining-nums' }}
            >
              {section.period}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 id={`ch-${section.slug}`} className="font-serif text-h2">
            {section.title}
          </h2>
          <div className="mt-6 space-y-5 font-serif text-body text-ink-soft">
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {section.quote && (
            <figure className="mt-10 border border-rule border-t-2 border-t-bensham bg-paper-warm p-6">
              <blockquote className="font-serif text-lead italic text-bensham">
                {section.quote.text}
              </blockquote>
              <figcaption className="mt-3 font-sans text-xs text-ink-mute">
                {section.quote.source}
              </figcaption>
            </figure>
          )}
        </div>

        {section.image && (
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Plate
                src={section.image}
                width={info?.width ?? 800}
                height={info?.height ?? 600}
                alt={section.imageAlt ?? section.title}
                sizes="(min-width: 1024px) 30vw, 100vw"
                caption={
                  entry ? (
                    <Link href={`/catalogue/${entry.slug}`} className="font-serif text-body italic text-ink-soft hover:text-bensham">
                      {entry.title}
                      {entry.year ? `, ${entry.year}` : ''}
                    </Link>
                  ) : (
                    section.imageCaption
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-content px-6 pb-16 pt-12">
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            1930 to 2020
          </p>
          <h1 className="mt-4 font-serif text-display">The story</h1>
        </div>
        <p className="font-serif text-lead text-ink-soft lg:col-span-5 lg:self-end">
          {storyIntro}
        </p>
      </header>

      <div className="mt-20 space-y-24">
        {storySections.map((section, i) => (
          <Chapter key={section.slug} section={section} number={i + 1} />
        ))}
      </div>
    </div>
  )
}
