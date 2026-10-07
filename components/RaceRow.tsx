import Image from 'next/image'
import Link from 'next/link'
import { RaceLine } from './RaceLine'
import { StatusLabel } from './StatusLabel'
import { paintedYears } from '@/lib/content/catalogue'
import { locationLine } from '@/lib/content/places'
import type { Place } from '@/lib/content/types'

// One place in the race, as its own card: the painting, the name, what became
// of it, and its race line. Cards sit on a paper-warm panel so each place
// reads as an object rather than a line of text on the page.
export function RaceRow({ place }: { place: Place }) {
  return (
    <Link
      href={`/places/${place.slug}`}
      className="group grid grid-cols-[4.5rem_1fr] items-start gap-5 border border-rule bg-paper p-4 transition-colors duration-colour hover:border-ink-mute sm:grid-cols-[7rem_1fr] sm:p-5"
    >
      <div className="border border-rule bg-mount p-1.5">
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
        <p className="mt-1 font-sans text-xs text-ink-mute">{locationLine(place)}</p>
        <RaceLine
          className="mt-3"
          painted={paintedYears(place)}
          status={place.status}
          cleared={place.cleared}
        />
      </div>
    </Link>
  )
}
