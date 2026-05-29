import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Prose } from '@/components/Prose'
import { StatusLabel } from '@/components/StatusLabel'
import { BackLink } from '@/components/BackLink'
import { Button } from '@/components/Button'
import { BookCallout } from '@/components/BookCallout'
import { places, placeBySlug } from '@/lib/content/places'
import type { Region } from '@/lib/content/types'

const regionLabels: Record<Region, string> = {
  gateshead: 'Gateshead',
  newcastle: 'Newcastle',
  beyond: 'Beyond Tyneside',
}

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
  return { title: place.name, description: place.paragraphs[0] }
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) notFound()

  const locationLine = [place.district, regionLabels[place.region]]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <BackLink href="/places">All places</BackLink>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          {place.image && (
            <figure className="bg-paper-warm p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.image}
                alt={`${place.name}, painted by Charlie Rogers`}
                className="block w-full h-auto"
              />
              <figcaption className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-3">
                {place.name}, from the book
              </figcaption>
            </figure>
          )}
        </div>

        <div>
          <Eyebrow>{locationLine}</Eyebrow>
          <h1 className="font-serif text-h1 mt-3">{place.name}</h1>
          <div className="mt-3">
            <StatusLabel status={place.status} />
          </div>
          <div className="mt-6">
            <Prose paragraphs={place.paragraphs} />
          </div>
          <div className="mt-8">
            <Button href="/work" variant="secondary">
              More of {regionLabels[place.region]} in the work
            </Button>
          </div>
        </div>
      </div>

      <BookCallout />
    </div>
  )
}
