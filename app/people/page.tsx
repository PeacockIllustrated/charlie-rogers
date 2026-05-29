import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { BookCallout } from '@/components/BookCallout'
import { people } from '@/lib/content/people'

export const metadata: Metadata = {
  title: 'People',
  description:
    'The family, friends, collectors, and collaborators who shaped the life and legacy of Gateshead painter Charlie Rogers.',
}

export default function PeoplePage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="People"
        intro="Charlie Rogers painted alone, but he was never isolated. A tight circle of family, fellow artists, collectors, and witnesses sustained fifty-six years of work and now carry his legacy forward."
      />

      <ul className="mt-12 grid gap-px bg-rule sm:grid-cols-2">
        {people.map((person) => (
          <li key={person.slug}>
            <Link
              href={`/people/${person.slug}`}
              className="block bg-paper p-6 hover:bg-paper-warm transition-colors"
            >
              <p className="font-serif text-h4">{person.name}</p>
              <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-1">
                {person.role}
                {person.years ? ` · ${person.years}` : ''}
              </p>
              <p className="font-serif text-body text-ink-soft mt-3">
                {person.paragraphs[0]}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <BookCallout />
    </div>
  )
}
