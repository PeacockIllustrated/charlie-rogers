import type { Metadata } from 'next'
import Link from 'next/link'
import { Plate } from '@/components/Plate'
import { RaceLine } from '@/components/RaceLine'
import { SectionHeading } from '@/components/SectionHeading'
import { StatusLabel } from '@/components/StatusLabel'
import { WalkRoute } from '@/components/walk/WalkRoute'
import { imageInfo, paintedYears } from '@/lib/content/catalogue'
import { locationLine } from '@/lib/content/places'
import {
  directionsUrl,
  legKm,
  stopDirectionsUrl,
  straightLineKm,
  walkCounts,
  walkStops,
  type WalkStop,
} from '@/lib/content/walk'

export const metadata: Metadata = {
  title: 'Walk the race',
  description:
    'A walk through Charlie Rogers’ Gateshead, from Saltwell Park to the railway arches: eight places he painted, and what is still there to see.',
  alternates: { canonical: '/walk' },
}

const precisionNote: Record<string, string> = {
  street: 'The marker is on the street, not a particular door.',
  district: 'The marker is the middle of an area, not an address.',
}

const words = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const word = (n: number) => words[n] ?? String(n)

function km(value: number): string {
  return value < 1 ? `${Math.round(value * 10) * 100} m` : `${value.toFixed(1)} km`
}

function Stop({ stop, index, leg }: { stop: WalkStop; index: number; leg?: number }) {
  const { place, now } = stop
  const info = place.image ? imageInfo(place.image) : undefined
  const gone = place.status === 'demolished'
  const note = precisionNote[place.coords!.precision]

  return (
    <li id={place.slug} className="scroll-mt-24">
      {leg !== undefined ? (
        <p className="ml-8 border-l border-dashed border-ink-mute py-5 pl-5 font-sans text-xs uppercase tracking-eyebrow text-ink-mute sm:ml-12">
          About {km(leg)} on
        </p>
      ) : null}
      <article
        className={`grid gap-6 border border-rule bg-paper p-5 sm:p-8 lg:grid-cols-12 lg:gap-10 ${gone ? 'border-t-2 border-t-bensham' : ''}`}
      >
        <div className="lg:col-span-5">
          {place.image && info ? (
            <Plate
              src={place.image}
              width={info.width}
              height={info.height}
              alt={`Charlie Rogers’ painting of ${place.name}`}
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
          ) : null}
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-h2 tabular-nums text-ink-mute" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className={`font-serif text-h2 ${gone ? 'text-bensham' : ''}`}>
                <span className="sr-only">Stop {index + 1}: </span>
                {place.name}
              </h3>
              <p className="mt-1 font-sans text-xs text-ink-mute">{locationLine(place)}</p>
            </div>
          </div>

          <div className="mt-5 border-y border-rule py-4">
            <StatusLabel status={place.status} />
            <RaceLine
              className="mt-3"
              painted={paintedYears(place)}
              status={place.status}
              cleared={place.cleared}
            />
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                What Charlie painted
              </dt>
              <dd className="mt-2 font-serif text-body text-ink-soft">{place.paragraphs[0]}</dd>
            </div>
            <div>
              <dt
                className={`font-sans text-xs uppercase tracking-eyebrow ${gone ? 'text-bensham' : 'text-ink-mute'}`}
              >
                {gone ? 'What is left' : 'What you will find'}
              </dt>
              <dd className="mt-2 font-serif text-body text-ink-soft">{now}</dd>
            </div>
          </dl>

          {note ? <p className="mt-4 font-sans text-xs text-ink-mute">{note}</p> : null}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <a
              href={stopDirectionsUrl(place)}
              className="font-sans text-small text-ink underline underline-offset-4 hover:text-bensham"
              rel="noopener"
            >
              Walking directions to here
            </a>
            <Link
              href={`/places/${place.slug}`}
              className="font-sans text-small text-ink-soft underline-offset-4 hover:underline"
            >
              More about {place.name.replace(/ \(.*\)$/, '')}
            </Link>
          </div>
        </div>
      </article>
    </li>
  )
}

export default function WalkPage() {
  const { stops, standing, altered, gone } = walkCounts
  const first = walkStops[0].place
  const last = walkStops[walkStops.length - 1].place

  return (
    <div className="pb-16 pt-12">
      <div className="mx-auto max-w-content px-6">
        <SectionHeading
          as="h1"
          eyebrow="Gateshead on foot"
          title="Walk the race"
          intro="Charlie spent fifty-six years painting Gateshead, often weeks ahead of the bulldozers. This walk takes you to the places he painted, in order, and tells you at each one whether he won."
        />

        <p className="mt-10 border-t border-rule pt-6 font-serif text-lead text-ink">
          {word(stops)} stops. {word(standing)} still standing, {word(altered).toLowerCase()} altered,{' '}
          <span className="text-bensham">{word(gone).toLowerCase()} gone</span>.
        </p>
      </div>

      <div className="mt-10 border-y border-rule bg-paper-warm py-12 lg:py-16">
        <div className="mx-auto grid max-w-content items-start gap-10 px-6 lg:grid-cols-12">
          <figure className="border border-rule bg-paper p-4 sm:p-6 lg:col-span-7">
            <WalkRoute stops={walkStops} />
            <figcaption className="mt-4 border-t border-rule pt-3 font-sans text-xs text-ink-mute">
              Sketch plan, north up. Stops joined in straight lines; the streets are yours to choose.
              Filled squares mark a building, hollow squares a street or an area.
            </figcaption>
          </figure>

          <aside className="space-y-6 lg:col-span-5">
            <div className="border border-rule border-t-2 border-t-ink bg-paper p-5 sm:p-6">
              <h2 className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                Before you set out
              </h2>
              <ul className="mt-4 space-y-3 font-serif text-body text-ink-soft">
                <li>
                  Start at {first.name} and finish by the railway at {last.district}, a short walk
                  from Gateshead Interchange.
                </li>
                <li>
                  At least {km(straightLineKm)} as the crow flies, and more on the ground. Allow an
                  afternoon.
                </li>
                <li>
                  Every stop is on a public street or in a public park. Nothing here asks you into
                  private property, and the houses are people&rsquo;s homes.
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={directionsUrl()}
                  rel="noopener"
                  className="inline-block bg-bensham px-4 py-2.5 font-sans text-small font-medium text-paper transition-colors hover:bg-bensham-deep"
                >
                  Open the walk in Google Maps
                </a>
                <Link
                  href="/places"
                  className="inline-block border border-ink-soft px-4 py-2.5 font-sans text-small font-medium text-ink transition-colors hover:bg-ink-soft hover:text-paper"
                >
                  All the places he painted
                </Link>
              </div>
            </div>

            <ol className="border border-rule bg-paper">
              {walkStops.map((s, i) => (
                <li key={s.place.slug} className="border-b border-rule last:border-b-0">
                  <a
                    href={`#${s.place.slug}`}
                    className="flex items-baseline gap-4 px-5 py-3 hover:bg-paper-warm"
                  >
                    <span className="w-6 font-sans text-xs tabular-nums text-ink-mute">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-serif text-body ${s.place.status === 'demolished' ? 'text-bensham' : 'text-ink'}`}
                    >
                      {s.place.name}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-content px-6" aria-label="The stops">
        <SectionHeading
          eyebrow="The stops"
          title={`${word(stops)} places, in walking order`}
          intro="Each stop shows the painting, the race line for the place, and what is there now. The line runs from 1964, when Charlie started, to 2020."
        />

        <ol className="mt-10">
          {walkStops.map((stop, i) => (
            <Stop
              key={stop.place.slug}
              stop={stop}
              index={i}
              leg={i > 0 ? legKm[i - 1] : undefined}
            />
          ))}
        </ol>
      </section>
    </div>
  )
}
