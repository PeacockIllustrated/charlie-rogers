import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { StatusLabel } from '@/components/StatusLabel'
import { BookCallout } from '@/components/BookCallout'
import { places, placesByRegion, regionOrder, regionLabels } from '@/lib/content/places'
import type { Place } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Places',
  description:
    'The streets, parks, churches, and market squares that Charlie Rogers painted across Gateshead, Newcastle, and beyond. Many of these buildings no longer exist.',
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <Link href={`/places/${place.slug}`} className="block group">
      {place.image && (
        <img
          src={place.image}
          alt={place.name}
          className="block w-full h-auto"
        />
      )}
      <div className="mt-3">
        <p className="font-serif text-h4 text-ink group-hover:text-bensham transition-colors">
          {place.name}
        </p>
        {place.district && (
          <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-1">
            {place.district}
          </p>
        )}
        <div className="mt-1">
          <StatusLabel status={place.status} />
        </div>
      </div>
    </Link>
  )
}

export default function PlacesPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Places"
        intro="Charlie raced the demolition crews. Of the streets, churches, and buildings he painted across Gateshead and Newcastle, a significant number are gone. This is where they stood."
      />

      <div className="mt-16 space-y-16">
        {regionOrder.map((region) => {
          const regionPlaces = placesByRegion(region)
          if (regionPlaces.length === 0) return null
          return (
            <section key={region}>
              <div className="mb-8">
                <Eyebrow>{regionLabels[region]}</Eyebrow>
                <h2 className="font-serif text-h2 mt-4">{regionLabels[region]}</h2>
              </div>
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {regionPlaces.map((place) => (
                  <PlaceCard key={place.slug} place={place} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <BookCallout />
    </div>
  )
}
