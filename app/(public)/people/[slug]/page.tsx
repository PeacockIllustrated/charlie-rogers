import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Prose } from '@/components/Prose'
import { BackLink } from '@/components/BackLink'
import { BookCallout } from '@/components/BookCallout'
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

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <BackLink href="/people">All people</BackLink>

      <header className="mt-6 max-w-reading">
        <Eyebrow>{person.role}</Eyebrow>
        <h1 className="font-serif text-h1 mt-3">{person.name}</h1>
        {person.years && (
          <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-2">
            {person.years}
          </p>
        )}
      </header>

      <div className="mt-8">
        <Prose paragraphs={person.paragraphs} />
      </div>

      <BookCallout />
    </div>
  )
}
