import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Plate } from '@/components/Plate'
import { RaceRow } from '@/components/RaceRow'
import { entryBySlug, type Entry } from '@/lib/content/catalogue'
import { places, placeBySlug } from '@/lib/content/places'

// The landing page reads like the opening of the book: one painting, the line
// that names the book, then the race itself. Every claim on this page comes
// from lib/content, so the numbers cannot drift from the pages they summarise.

function must<T>(v: T | undefined | null, what: string): T {
  if (v === undefined || v === null) throw new Error(`Home page: missing ${what}`)
  return v
}

const hero = must(entryBySlug('bensham-road-gateshead-1970'), 'hero entry')
const origin = must(entryBySlug('cotfield-street-bensham-gateshead'), 'origin entry')

// The salon: the photographed originals and the largest card artwork, hung as
// a wall rather than a grid. Spans are set per picture to suit its shape.
const salon: { slug: string; span: string }[] = [
  { slug: 'the-joke-shop-gateshead-on-tyne-1966', span: 'lg:col-span-7' },
  { slug: 'pop-1967', span: 'lg:col-span-5 lg:mt-24' },
  { slug: 'the-men-on-the-seats-1973', span: 'lg:col-span-5' },
  { slug: 'bigg-market-newcastle-on-tyne-1975', span: 'lg:col-span-7 lg:-mt-16' },
  { slug: 'the-monument-with-snow-newcastle-on-tyne-1996', span: 'lg:col-span-6' },
  { slug: 'four-doors-at-school-street-gateshead-1977', span: 'lg:col-span-6 lg:mt-12' },
]

// The race, told through the places. Gone first, then altered, then the one
// that survived, for contrast.
const raceOrder = [
  'cotfield-street',
  'st-cuthberts-church-bensham',
  'railway-quarter-gateshead-east',
  'coatsworth-road',
  'saltwell-park',
]

// Post-war Northern chroniclers, as Brian Rankin places them. Dates are birth
// and death years; the bars share one axis so the overlap is visible.
const lineage = [
  { name: 'L. S. Lowry', born: 1887, died: 1976, place: 'Salford', subject: 'the mills and crowds of industrial Lancashire' },
  { name: 'Norman Cornish', born: 1919, died: 2014, place: 'Spennymoor', subject: 'the pit village and its people' },
  { name: 'Charlie Rogers', born: 1930, died: 2020, place: 'Gateshead', subject: 'the back lanes of Tyneside, before the bulldozers' },
]
const AXIS_START = 1880
const AXIS_END = 2025
const pos = (y: number) => ((y - AXIS_START) / (AXIS_END - AXIS_START)) * 100

function SalonPiece({ entry, span }: { entry: Entry; span: string }) {
  return (
    <Link href={`/catalogue/${entry.slug}`} className={`group block ${span}`}>
      <div className="border border-rule bg-mount px-[5%] pb-[8%] pt-[5%] transition-colors duration-colour group-hover:border-ink-mute">
        <Image
          src={entry.image.src}
          width={entry.image.width}
          height={entry.image.height}
          alt={entry.alt}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: entry.image.width }}
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
          {entry.title}
        </h3>
        <span className="shrink-0 font-sans text-xs text-ink-mute">{entry.year}</span>
      </div>
    </Link>
  )
}

export default function Home() {
  const gone = places.filter((p) => p.status === 'demolished').length
  const altered = places.filter((p) => p.status === 'altered').length
  const race = raceOrder.map((s) => must(placeBySlug(s), `place ${s}`))

  return (
    <div>
      {/* The opening plate */}
      <section className="mx-auto max-w-content px-6 pb-16 pt-10 lg:pb-24 lg:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:pb-14">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              Charlie Rogers &middot; Gateshead &middot; 1930 to 2020
            </p>
            <h1 className="mt-6 font-serif text-display text-ink">
              Pursued by <span className="italic text-bensham">bulldozers</span>
            </h1>
            <p className="mt-8 max-w-[30rem] font-serif text-lead text-ink-soft">
              For fifty-six years a self-taught painter from Gateshead raced the
              demolition crews, recording the back lanes, pubs, churches and
              corner shops of Tyneside in the days before they came down.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/work">See the work</Button>
              <Button href="/story" variant="secondary">
                Read his story
              </Button>
            </div>
          </div>
          <div className="lg:col-span-7">
            <Plate
              src={hero.image.src}
              width={hero.image.width}
              height={hero.image.height}
              alt={hero.alt}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              caption={
                <Link href={`/catalogue/${hero.slug}`} className="hover:text-bensham">
                  <span className="font-serif text-body italic text-ink-soft">{hero.title}</span>
                  <span className="ml-2">{hero.year}</span>
                </Link>
              }
            />
          </div>
        </div>
      </section>

      {/* His own words, the book's title line */}
      <section className="border-y border-rule">
        <div className="mx-auto max-w-content px-6 py-16 lg:py-24">
          <blockquote className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-h1 italic text-ink">
              &ldquo;I feel I have spent much of my career being pursued by
              bulldozers.&rdquo;
            </p>
            <footer className="mt-6 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              Charlie Rogers
            </footer>
          </blockquote>
        </div>
      </section>

      {/* The race */}
      <section className="border-y border-rule bg-paper-warm">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-4">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              The race
            </p>
            <h2 className="mt-4 font-serif text-h1">He painted them. Then they were gone.</h2>
            <p className="mt-6 font-serif text-body text-ink-soft">
              Each line runs across his painting life, 1964 to 2020. A square
              marks a painting. Red is a building lost, ochre one altered past
              recognition, green one still standing. Of the {places.length}{' '}
              places on this site, {gone} are gone and {altered} more are
              altered.
            </p>
            <div className="mt-8">
              <Button href="/places" variant="tertiary">
                All the places
              </Button>
            </div>
          </div>
          <ol className="space-y-3 lg:col-span-8 lg:pl-6">
            {race.map((place) => (
              <li key={place.slug}>
                <RaceRow place={place} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 1964 */}
      <section>
        <div className="mx-auto grid max-w-content gap-10 px-6 py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
          <div className="lg:col-span-5">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              The lucky break
            </p>
            <p
              className="mt-2 font-serif leading-none tracking-[-0.03em] text-bensham"
              style={{ fontSize: 'clamp(6rem, 16vw, 13rem)', fontVariantNumeric: 'lining-nums' }}
              aria-hidden="true"
            >
              1964
            </p>
            <h2 className="sr-only">1964, the lucky break</h2>
            <div className="mt-6 max-w-reading space-y-5 font-serif text-body text-ink-soft">
              <p>
                At thirty-four, Charlie took a heavy knock to a damaged knee in a
                cup tie and was signed off for a week. Limping to his aunt&rsquo;s
                house on Bensham Road, he sat with a cup of tea and looked out at
                the back lane of Cotfield Street. Over five or six mornings he
                painted it, in pen and wash.
              </p>
              <p>
                The street was demolished soon after. He spent the rest of his
                life racing the bulldozers, and credited it all to the
                anonymous half-back who crippled him.
              </p>
            </div>
            <div className="mt-8">
              <Button href="/story" variant="tertiary">
                How it began
              </Button>
            </div>
          </div>
          <div className="lg:col-span-7 lg:pt-16">
            <Plate
              src={origin.image.src}
              width={origin.image.width}
              height={origin.image.height}
              alt={origin.alt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              caption={
                <>
                  <Link href={`/catalogue/${origin.slug}`} className="font-serif text-body italic text-ink-soft hover:text-bensham">
                    {origin.title}
                  </Link>
                  <span className="mt-1 block">
                    A later painting of the same street. The first one, Back
                    Cotfield Street, has not been found.
                  </span>
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* A critic's line, on the book's own red */}
      <section className="bg-bensham-deep text-paper">
        <div className="mx-auto max-w-content px-6 py-20 lg:py-28">
          <blockquote className="max-w-4xl">
            <p className="font-serif text-h1 italic">
              &ldquo;The subjects of his paintings are the things and places you
              never notice until they are gone.&rdquo;
            </p>
            <footer className="mt-6 font-sans text-xs uppercase tracking-eyebrow text-paper/75">
              Derek Kirkup
            </footer>
          </blockquote>
        </div>
      </section>

      {/* The salon */}
      <section className="mx-auto max-w-content px-6 py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              From the catalogue
            </p>
            <h2 className="mt-4 font-serif text-h1">Tyneside, as he saw it</h2>
          </div>
          <Button href="/work" variant="secondary">
            The whole catalogue
          </Button>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-14 lg:grid-cols-12">
          {salon.map(({ slug, span }) => (
            <SalonPiece key={slug} entry={must(entryBySlug(slug), slug)} span={span} />
          ))}
        </div>
      </section>

      {/* The lineage */}
      <section className="border-t border-rule bg-paper-warm">
        <div className="mx-auto max-w-content px-6 py-20 lg:py-28">
          <div className="max-w-reading">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              The third name
            </p>
            <h2 className="mt-4 font-serif text-h1">Lowry, Cornish, Rogers</h2>
            <p className="mt-6 font-serif text-body text-ink-soft">
              Brian Rankin&rsquo;s book places Charlie beside them, as the third
              of the post-war chroniclers of working life in the North of
              England. Cornish came to his first exhibition in
              1965, and they were friends for life.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {lineage.map((l, i) => (
              <div key={l.name} className={`border border-rule border-t-2 bg-paper p-6 ${i === 2 ? 'border-t-bensham' : 'border-t-ink'}`}>
                <p className="font-sans text-xs text-ink-mute">{l.place}</p>
                <h3 className={`mt-2 font-serif text-h2 ${i === 2 ? 'text-bensham' : ''}`}>{l.name}</h3>
                <p className="mt-1 font-sans text-small text-ink-soft">
                  {l.born} to {l.died}
                </p>
                <p className="mt-4 font-serif text-body text-ink-soft">{l.subject}</p>
              </div>
            ))}
          </div>

          {/* Shared lifespan axis */}
          <div className="mt-6 border border-rule bg-paper p-6" aria-hidden="true">
            <div className="space-y-3">
              {lineage.map((l, i) => (
                <div key={l.name} className="relative h-3">
                  <div className="absolute inset-x-0 top-1/2 border-t border-rule" />
                  <div
                    className={`absolute top-0 h-3 ${i === 2 ? 'bg-bensham' : 'bg-ink-soft'}`}
                    style={{ left: `${pos(l.born)}%`, width: `${pos(l.died) - pos(l.born)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="relative mt-3 h-4 font-sans text-xs text-ink-mute">
              {[1900, 1925, 1950, 1975, 2000].map((y) => (
                <span key={y} className="absolute -translate-x-1/2" style={{ left: `${pos(y)}%` }}>
                  {y}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
