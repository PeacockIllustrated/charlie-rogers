import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { BookCallout } from '@/components/BookCallout'
import { themes, themePaintings, type Theme } from '@/lib/content/themes'
import { allPaintings } from '@/lib/paintings'

export const metadata: Metadata = {
  title: 'The work',
  description:
    'The paintings of Charlie Rogers, organised by the chapters of Pursued by Bulldozers: Gateshead, Newcastle, Paris, family, characters and more.',
}

// Group the themes geographically, the way the project is organised, then by
// subject. Themes with no region fall into the final group.
const groups: { key: string; label: string }[] = [
  { key: 'gateshead', label: 'Gateshead' },
  { key: 'newcastle', label: 'Newcastle' },
  { key: 'beyond', label: 'Beyond Tyneside' },
  { key: 'themes', label: 'Subjects and themes' },
]

function ThemeCard({ theme }: { theme: Theme }) {
  const paintings = themePaintings(theme)
  // Use the highest-resolution plate in the range as the cover so it stays crisp.
  const cover = [...paintings].sort((a, b) => b.width - a.width)[0]
  return (
    <Link href={`/work/${theme.slug}`} className="group block">
      {cover && (
        <div className="flex h-52 items-center justify-center bg-paper-warm p-3 sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.web}
            alt={`${theme.title}, paintings by Charlie Rogers`}
            loading="lazy"
            className="h-auto max-h-full w-auto max-w-full"
          />
        </div>
      )}
      <h3 className="mt-4 font-serif text-h4 transition-colors group-hover:text-bensham">
        {theme.title}
      </h3>
      <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
        {paintings.length} {paintings.length === 1 ? 'painting' : 'paintings'}
      </p>
      <p className="mt-2 font-serif text-body text-ink-soft">{theme.blurb}</p>
    </Link>
  )
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

      {groups.map((group) => {
        const inGroup = themes.filter(
          (t) => (t.region ?? 'themes') === group.key,
        )
        if (inGroup.length === 0) return null
        return (
          <section key={group.key} className="mt-14">
            <Eyebrow>{group.label}</Eyebrow>
            <div className="mt-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {inGroup.map((theme) => (
                <ThemeCard key={theme.slug} theme={theme} />
              ))}
            </div>
          </section>
        )
      })}

      <BookCallout />
    </div>
  )
}
