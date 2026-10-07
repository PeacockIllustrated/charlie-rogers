import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Prose } from '@/components/Prose'
import { BackLink } from '@/components/BackLink'
import Link from 'next/link'
import { people, personBySlug } from '@/lib/content/people'

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const person = personBySlug(slug)
  if (!person) return { title: 'Not found' }
  return { title: person.name, description: person.paragraphs[0] }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const person = personBySlug(slug)
  if (!person) notFound()

  const others = people.filter((p) => p.slug !== person.slug)

  return (
    <div>
      <header className="border-b border-rule bg-paper-warm">
        <div className="mx-auto max-w-content px-6 pb-12 pt-12">
          <BackLink href="/people">All people</BackLink>
          <div className="mt-8 max-w-reading">
            <Eyebrow>{person.role}</Eyebrow>
            <h1 className="font-serif text-display-2 mt-3">{person.name}</h1>
            {person.years && (
              <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-3">
                {person.years}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-content items-start gap-10 px-6 py-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Prose paragraphs={person.paragraphs} />
        </div>
        {/* The rest of the cast, so a reader moves from person to person
            without going back to the index */}
        <nav aria-label="Other people" className="border border-rule bg-paper-warm p-5 sm:p-6 lg:col-span-4">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            Also in Charlie&rsquo;s life
          </p>
          <ul className="mt-3">
            {others.map((o) => (
              <li key={o.slug} className="border-t border-rule first:border-t-0">
                <Link
                  href={`/people/${o.slug}`}
                  className="group block py-3"
                >
                  <span className="block font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
                    {o.name}
                  </span>
                  <span className="mt-0.5 block font-sans text-xs text-ink-mute">{o.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
