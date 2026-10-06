import type { Metadata } from 'next'
import { RaceRow } from '@/components/RaceRow'
import { places } from '@/lib/content/places'
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

const topBorder: Record<Status, string> = {
  demolished: 'border-t-bensham',
  altered: 'border-t-ochre',
  extant: 'border-t-sage',
  unknown: 'border-t-ink-mute',
}

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
    <div className="pt-12">
      <div className="mx-auto max-w-content px-6">
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

        <dl className="mt-12 grid grid-cols-3 gap-3">
          {lossOrder.map(({ status, label }) => (
            <div
              key={status}
              className={`flex flex-col-reverse border border-rule border-t-2 bg-paper-warm p-4 sm:p-6 ${topBorder[status]}`}
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

        <section className="mt-16 pb-20" aria-labelledby="places-map-heading">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2
                id="places-map-heading"
                className="font-sans text-xs uppercase tracking-eyebrow text-bensham"
              >
                Where they stood
              </h2>
              <p className="mt-4 font-serif text-body text-ink-soft">
                The Tyneside places, plotted. A solid marker is the site itself.
                A hollow one is a street or an area, which is all that can
                honestly be said for the buildings that came down before anyone
                recorded exactly where they stood.
              </p>
              <p className="mt-4 font-sans text-small text-ink-mute">
                Positions are working estimates and have not yet been checked
                against survey records. Paris and Spennymoor sit outside the
                frame and are listed below rather than plotted.
              </p>
            </div>
            <div className="lg:col-span-8">
              <PlacesMap places={places} />
            </div>
          </div>
        </section>
      </div>

      {/* The places themselves, as cards on a panel */}
      <div className="border-t border-rule bg-paper-warm py-16 lg:py-20">
        <div className="mx-auto max-w-content space-y-16 px-6">
          {regionOrder.map((region) => {
            const regionPlaces = byRegion(region)
            if (regionPlaces.length === 0) return null
            return (
              <section key={region} className="grid gap-6 lg:grid-cols-12">
                <h2 className="font-serif text-h1 lg:col-span-4">{regionLabels[region]}</h2>
                <ol className="space-y-3 lg:col-span-8">
                  {regionPlaces.map((place) => (
                    <li key={place.slug}>
                      <RaceRow place={place} />
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
