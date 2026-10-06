import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
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
      className="group flex h-full flex-col border border-rule bg-paper p-5 transition-colors duration-colour hover:border-ink-mute sm:p-6"
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
      <p className="font-serif text-body text-ink-soft mt-3 line-clamp-4">
        {person.paragraphs[0]}
      </p>
      <span className="mt-auto pt-5 font-sans text-xs uppercase tracking-eyebrow text-ink-mute transition-colors duration-colour group-hover:text-bensham">
        Read more
      </span>
    </Link>
  )
}

export default function PeopleIndex() {
  const [lead, ...rest] = people

  return (
    <div className="pt-12">
      <div className="mx-auto max-w-content px-6">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="People"
        intro="Charlie did not work in isolation. These are the people in his life and in his paintings, the family who sat for him and the friends and collectors who kept his work together."
      />

      {lead && (
        <Link
          href={`/people/${lead.slug}`}
          className="group mt-12 grid gap-6 border border-rule border-t-2 border-t-bensham bg-paper-warm p-6 transition-colors duration-colour hover:border-ink-mute sm:p-8 lg:grid-cols-12 lg:p-10"
        >
          <div className="lg:col-span-5">
          <Eyebrow rule={false}>{lead.role}</Eyebrow>
          <h2 className="font-serif text-display-2 mt-2 group-hover:text-bensham transition-colors">
            {lead.name}
          </h2>
          {lead.years && (
            <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-2">
              {lead.years}
            </p>
          )}
          </div>
          <p className="font-serif text-body-lg text-ink-soft max-w-reading lg:col-span-7">
            {lead.paragraphs[0]}
          </p>
        </Link>
      )}
      </div>

      {/* The rest of the cast, one card each, on a warm panel */}
      <div className="mt-16 border-t border-rule bg-paper-warm py-16 lg:py-20">
        <div className="mx-auto grid max-w-content gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((person) => (
            <RosterEntry key={person.slug} person={person} />
          ))}
        </div>
      </div>

    </div>
  )
}
