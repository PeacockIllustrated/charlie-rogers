import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SectionHeading } from '@/components/SectionHeading'
import { Prose } from '@/components/Prose'
import { Button } from '@/components/Button'
import { BookCallout } from '@/components/BookCallout'
import { people } from '@/lib/content/people'

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const person = people.find((x) => x.slug === slug)
  return person
    ? { title: person.name, description: person.role }
    : { title: 'Not found' }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const person = people.find((x) => x.slug === slug)
  if (!person) notFound()

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading as="h1" eyebrow={person.role} title={person.name} />

      {person.years && (
        <p className="font-sans text-small text-ink-mute mt-3">{person.years}</p>
      )}

      <div className="mt-8">
        <Prose paragraphs={person.paragraphs} />
      </div>

      <div className="mt-10">
        <Button variant="tertiary" href="/people">
          All people
        </Button>
      </div>

      <BookCallout />
    </div>
  )
}
