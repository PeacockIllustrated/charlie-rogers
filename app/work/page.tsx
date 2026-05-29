import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { BookCallout } from '@/components/BookCallout'
import { themes, themePaintings } from '@/lib/content/themes'
import { allPaintings } from '@/lib/paintings'

export const metadata: Metadata = {
  title: 'The work',
  description:
    'The paintings of Charlie Rogers, organised by the chapters of Pursued by Bulldozers: Gateshead, Newcastle, Paris, family, characters and more.',
}

export default function WorkIndex() {
  const total = allPaintings().length
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="The work"
        title="The work"
        intro={`Charlie made around a thousand paintings and drawings across fifty-six years. This selection of ${total} is drawn from the book and grouped by its chapters.`}
      />

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const paintings = themePaintings(theme)
          const cover = paintings[0]
          return (
            <Link key={theme.slug} href={`/work/${theme.slug}`} className="group">
              {cover && (
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover.web}
                    alt={`${theme.title}, paintings by Charlie Rogers`}
                    loading="lazy"
                    className="block w-full h-auto"
                  />
                </div>
              )}
              <h2 className="font-serif text-h4 mt-4 group-hover:text-bensham transition-colors">
                {theme.title}
              </h2>
              <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-1">
                {paintings.length} {paintings.length === 1 ? 'painting' : 'paintings'}
              </p>
              <p className="font-serif text-body text-ink-soft mt-2">
                {theme.blurb}
              </p>
            </Link>
          )
        })}
      </div>

      <BookCallout />
    </div>
  )
}
