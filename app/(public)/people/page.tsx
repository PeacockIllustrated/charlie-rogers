import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { BookCallout } from '@/components/BookCallout'
import { people } from '@/lib/content/people'
import type { Person } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'People',
  description:
    'The family, friends and collectors around Charlie Rogers: Ann, Pop, Charlie Junior, Norman Cornish and the people who kept his work together.',
}

function RosterEntry({ person }: { person: Person }) {
  return (
    <Link
      href={`/people/${person.slug}`}
      className="group block border-t border-rule pt-5"
    >
      <span className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
        {person.role}
      </span>
      <h3 className="font-serif text-h3 mt-1 group-hover:text-bensham transition-colors">
        {person.name}
      </h3>
      {person.years && (
        <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-1">
          {person.years}
        </p>
      )}
      <p className="font-serif text-body text-ink-soft mt-3 line-clamp-3">
        {person.paragraphs[0]}
      </p>
    </Link>
  )
}

export default function PeopleIndex() {
  const [lead, ...rest] = people

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="People"
        intro="Charlie did not work in isolation. These are the people in his life and in his paintings, the family who sat for him and the friends and collectors who kept his work together."
      />

      {lead && (
        <Link
          href={`/people/${lead.slug}`}
          className="group mt-12 block border-t-2 border-ink pt-6"
        >
          <Eyebrow rule={false}>{lead.role}</Eyebrow>
          <h2 className="font-serif text-display-2 mt-2 group-hover:text-bensham transition-colors">
            {lead.name}
          </h2>
          {lead.years && (
            <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-2">
              {lead.years}
            </p>
          )}
          <p className="font-serif text-body-lg text-ink-soft mt-4 max-w-reading">
            {lead.paragraphs[0]}
          </p>
        </Link>
      )}

      <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((person) => (
          <RosterEntry key={person.slug} person={person} />
        ))}
      </div>

      <BookCallout />
    </div>
  )
}
