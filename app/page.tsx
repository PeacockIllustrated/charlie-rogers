import Link from 'next/link'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { PaintingCard } from '@/components/PaintingCard'
import { BookCallout } from '@/components/BookCallout'

// Editorial landing. Leads with the bulldozers thesis and the 1964 origin story,
// then routes into the book's sections. Teaser depth: enough to draw a reader in,
// the full account is in the book.

// Featured uses the page 27 starter set, which the book labels by location.
const featured = [
  {
    src: '/paintings/thumbs/page_027_img_000.jpg',
    title: 'Saltwell Park',
    location: 'Saltwell',
    status: 'extant' as const,
  },
  {
    src: '/paintings/thumbs/page_027_img_006.jpg',
    title: 'Cotfield Street',
    location: 'Bensham',
    status: 'demolished' as const,
  },
  {
    src: '/paintings/thumbs/page_027_img_003.jpg',
    title: 'Shipley Art Gallery',
    location: 'Gateshead',
    status: 'extant' as const,
  },
]

const sections = [
  {
    href: '/story',
    title: 'The story',
    blurb:
      'From a footballer sidelined by a knee injury to four Royal Academy summer shows. Fifty-six years at the easel he never owned.',
  },
  {
    href: '/work',
    title: 'The work',
    blurb:
      'Around a thousand paintings, organised the way the book is: Gateshead, Newcastle, Paris, family, characters and more.',
  },
  {
    href: '/places',
    title: 'Places',
    blurb:
      'The streets he painted, marked extant or demolished. Half of the buildings here are gone.',
  },
  {
    href: '/people',
    title: 'People',
    blurb:
      'Ann, Pop, Charlie Junior, Norman Cornish and the collectors who kept the work together.',
  },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-content px-6">
      <section className="py-20 max-w-reading">
        <Eyebrow>Charlie Rogers &middot; Gateshead, 1930 to 2020</Eyebrow>
        <h1 className="font-serif text-display-2 mt-4">Pursued by bulldozers</h1>
        <p className="font-serif text-body-lg text-ink-soft mt-6">
          For fifty-six years Charlie Rogers painted the back lanes, pubs,
          churches and corner shops of Tyneside, often days or weeks before the
          demolition crews arrived. Around a thousand works survive. This is the
          archive of what he saw, and of what is gone.
        </p>
        <blockquote className="font-serif italic text-h3 text-bensham mt-10">
          &ldquo;As fast as Tyneside&rsquo;s characteristic buildings fall,
          Charlie Rogers seems to be there to catch them.&rdquo;
        </blockquote>
        <p className="font-sans text-small text-ink-mute mt-2">Tom Pickard, 1973</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/work">Browse the work</Button>
          <Button href="/story" variant="secondary">
            Read his story
          </Button>
        </div>
      </section>

      <section className="pb-20">
        <Eyebrow>The lucky break</Eyebrow>
        <div className="mt-4 max-w-reading font-serif text-body-lg text-ink-soft space-y-5">
          <p>
            In 1964, aged thirty-four, Charlie took a heavy knock to a damaged
            knee in a cup tie and was signed off for a week. Limping to his
            aunt&rsquo;s house on Bensham Road, he sat with a cup of tea and
            looked out at the back lane opposite. Over five or six mornings he
            painted it. The street was demolished soon after.
          </p>
          <p>
            He spent the rest of his life racing the bulldozers, and credited it
            all to the half-back who crippled him.
          </p>
        </div>
        <div className="mt-6">
          <Button href="/story" variant="tertiary">
            How it began
          </Button>
        </div>
      </section>

      <section className="pb-20">
        <Eyebrow>From the archive</Eyebrow>
        <div className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PaintingCard key={p.src} {...p} />
          ))}
        </div>
      </section>

      <section className="pb-8">
        <Eyebrow>Explore the archive</Eyebrow>
        <div className="mt-6 grid gap-px bg-rule sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-paper p-8 hover:bg-paper-warm transition-colors"
            >
              <h2 className="font-serif text-h3 group-hover:text-bensham transition-colors">
                {s.title}
              </h2>
              <p className="font-serif text-body text-ink-soft mt-2 max-w-reading">
                {s.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="pb-24">
        <BookCallout text="Charlie Rogers, Pursued by Bulldozers, compiled by Brian Rankin, gathers more than a hundred paintings alongside the full story of his life and work." />
      </div>
    </div>
  )
}
