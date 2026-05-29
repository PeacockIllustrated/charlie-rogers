import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { StatusLabel } from '@/components/StatusLabel'
import { BookCallout } from '@/components/BookCallout'
import { places } from '@/lib/content/places'
import type { Region, Status } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Places',
  description:
    'The streets, churches and buildings Charlie Rogers painted across Gateshead, Newcastle and beyond, marked extant or demolished.',
}

const regionLabels: Record<Region, string> = {
  gateshead: 'Gateshead',
  newcastle: 'Newcastle',
  beyond: 'Beyond Tyneside',
}

const regionOrder: Region[] = ['gateshead', 'newcastle', 'beyond']

// Loss summary doubles as a legend for the status colours and lands the thesis.
const lossOrder: { status: Status; label: string }[] = [
  { status: 'demolished', label: 'demolished' },
  { status: 'altered', label: 'altered' },
  { status: 'extant', label: 'still standing' },
]

const dotClass: Record<Status, string> = {
  demolished: 'bg-bensham',
  altered: 'bg-ochre',
  extant: 'bg-sage',
  unknown: 'bg-ink-mute',
}

export default function PlacesIndex() {
  const byRegion = (region: Region) => places.filter((p) => p.region === region)
  const count = (status: Status) =>
    places.filter((p) => p.status === status).length

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Places"
        intro="Charlie raced the demolition crews. Of the streets, churches, and buildings he painted across Gateshead and Newcastle, a significant number are gone. This is where they stood."
      />

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-6">
        {lossOrder.map(({ status, label }) => (
          <div key={status} className="flex items-baseline gap-2">
            <span
              className={`inline-block h-2 w-2 ${dotClass[status]}`}
              aria-hidden="true"
            />
            <dt className="font-serif text-h4">{count(status)}</dt>
            <dd className="font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
              {label}
            </dd>
          </div>
        ))}
      </dl>

      {regionOrder.map((region) => {
        const regionPlaces = byRegion(region)
        if (regionPlaces.length === 0) return null
        return (
          <section key={region} className="mt-14">
            <Eyebrow>{regionLabels[region]}</Eyebrow>
            <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {regionPlaces.map((place) => (
                <Link
                  key={place.slug}
                  href={`/places/${place.slug}`}
                  className="group"
                >
                  {place.image ? (
                    <div className="bg-paper-warm p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={place.image}
                        alt={place.name}
                        loading="lazy"
                        className="block w-full h-auto"
                      />
                    </div>
                  ) : null}
                  <h3 className="font-serif text-h4 mt-3 group-hover:text-bensham transition-colors">
                    {place.name}
                  </h3>
                  <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute mt-1">
                    {place.district ? `${place.district}, ` : ''}
                    {regionLabels[place.region]}
                  </p>
                  <div className="mt-2">
                    <StatusLabel status={place.status} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      <BookCallout />
    </div>
  )
}
