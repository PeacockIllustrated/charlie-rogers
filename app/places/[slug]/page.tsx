import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SectionHeading } from '@/components/SectionHeading'
import { Prose } from '@/components/Prose'
import { StatusLabel } from '@/components/StatusLabel'
import { Button } from '@/components/Button'
import { BookCallout } from '@/components/BookCallout'
import { places, placeBySlug, regionLabels } from '@/lib/content/places'

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) return { title: 'Not found' }
  return {
    title: place.name,
    description: place.district ?? regionLabels[place.region],
  }
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) notFound()

  const eyebrow = place.district ?? regionLabels[place.region]

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading as="h1" eyebrow={eyebrow} title={place.name} />

      <div className="mt-4">
        <StatusLabel status={place.status} />
      </div>

      {place.image && (
        <div className="mt-8 max-w-reading">
          <img
            src={place.image}
            alt={place.name}
            className="block w-full h-auto"
          />
        </div>
      )}

      <div className="mt-8">
        <Prose paragraphs={place.paragraphs} />
      </div>

      <div className="mt-10">
        <Button variant="tertiary" href="/places">
          All places
        </Button>
      </div>

      <BookCallout />
    </div>
  )
}
