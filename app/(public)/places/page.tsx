import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RaceLine } from '@/components/RaceLine'
import { StatusLabel } from '@/components/StatusLabel'
import { paintedYears } from '@/lib/content/catalogue'
import { places, locationLine } from '@/lib/content/places'
import { PlacesMap } from '@/components/places/PlacesMap'
import type { Region, Status } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Places',
  description:
    'The streets, churches and buildings Charlie Rogers painted across Gateshead, Newcastle and beyond, and what became of each.',
  alternates: { canonical: '/places' },
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
    <div className="mx-auto max-w-content px-6 pb-16 pt-12">
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            Where he painted
          </p>
          <h1 className="mt-4 font-serif text-display">Places</h1>
        </div>
        <p className="font-serif text-lead text-ink-soft lg:col-span-5 lg:self-end">
          Charlie raced the demolition crews. These are the streets, churches
          and buildings he painted, and what became of each.
        </p>
      </header>

      <dl className="mt-12 grid grid-cols-3 border-y border-rule">
        {lossOrder.map(({ status, label }, i) => (
          <div
            key={status}
            className={`flex flex-col-reverse py-6 ${i > 0 ? 'border-l border-rule pl-4 sm:pl-8' : ''}`}
          >
            <dt className="mt-3 flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
              <span className={`inline-block h-2 w-2 ${dotClass[status]}`} aria-hidden="true" />
              {label}
            </dt>
            <dd
              className="font-serif text-display leading-none"
              style={{ fontVariantNumeric: 'lining-nums' }}
            >
              {count(status)}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-16" aria-labelledby="places-map-heading">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2
              id="places-map-heading"
              className="font-sans text-xs uppercase tracking-eyebrow text-bensham"
            >
              Where they stood
            </h2>
            <p className="mt-4 font-serif text-body text-ink-soft">
              The Tyneside places, plotted. A solid marker is the site itself. A
              hollow one is a street or an area, which is all that can honestly
              be said for the buildings that came down before anyone recorded
              exactly where they stood.
            </p>
            <p className="mt-4 font-sans text-small text-ink-mute">
              Positions are working estimates and have not yet been checked
              against survey records. Paris and Spennymoor sit outside the frame
              and are listed below rather than plotted.
            </p>
          </div>
          <div className="lg:col-span-8">
            <PlacesMap places={places} />
          </div>
        </div>
      </section>

      {regionOrder.map((region) => {
        const regionPlaces = byRegion(region)
        if (regionPlaces.length === 0) return null
        return (
          <section key={region} className="mt-20">
            <div className="grid gap-6 lg:grid-cols-12">
              <h2 className="font-serif text-h1 lg:col-span-4">{regionLabels[region]}</h2>
              <ol className="lg:col-span-8">
                {regionPlaces.map((place) => (
                  <li key={place.slug} className="border-t border-rule py-6 last:border-b">
                    <Link
                      href={`/places/${place.slug}`}
                      className="group grid grid-cols-[4.5rem_1fr] items-start gap-5 sm:grid-cols-[7rem_1fr]"
                    >
                      <div className="bg-mount p-1.5">
                        {place.image ? (
                          <Image
                            src={place.image}
                            width={280}
                            height={210}
                            alt=""
                            sizes="112px"
                            className="block aspect-[4/3] h-auto w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-[4/3]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="font-serif text-h3 transition-colors duration-colour group-hover:text-bensham">
                            {place.name}
                          </h3>
                          <StatusLabel status={place.status} />
                        </div>
                        <p className="mt-1 font-sans text-xs text-ink-mute">
                          {locationLine(place)}
                        </p>
                        <RaceLine
                          className="mt-3"
                          painted={paintedYears(place)}
                          status={place.status}
                          cleared={place.cleared}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )
      })}
    </div>
  )
}
