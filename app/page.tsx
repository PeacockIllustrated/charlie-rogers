import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { PaintingCard } from '@/components/PaintingCard'

// Phase 0 placeholder. The full editorial home is built in Phase 2, leading with
// the bulldozers thesis and the 1964 origin story. The three cards below use real
// images from the page 27 starter set so the design system can be reviewed against
// actual work. Their metadata is not yet verified.
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

export default function Home() {
  return (
    <div className="mx-auto max-w-content px-6">
      <section className="py-20 max-w-reading">
        <Eyebrow>Charlie Rogers · Gateshead</Eyebrow>
        <h1 className="font-serif text-display-2 mt-4">Pursued by bulldozers</h1>
        <p className="font-serif text-body-lg text-ink-soft mt-6">
          For fifty-six years Charlie Rogers painted the back lanes, pubs,
          churches and corner shops of Tyneside, often days or weeks before the
          demolition crews arrived. Around a thousand works survive. This is the
          archive of what he saw, and of what is gone.
        </p>
        <blockquote className="font-serif italic text-h3 text-bensham mt-10">
          &ldquo;As fast as Tyneside&rsquo;s characteristic buildings fall
          Charlie Rogers seems to be there to catch them.&rdquo;
        </blockquote>
        <p className="font-sans text-small text-ink-mute mt-2">Tom Pickard, 1973</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/paintings">Browse the paintings</Button>
          <Button href="/about" variant="secondary">
            Read his story
          </Button>
        </div>
      </section>

      <section className="pb-24">
        <Eyebrow>From the archive</Eyebrow>
        <div className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PaintingCard key={p.src} {...p} />
          ))}
        </div>
      </section>
    </div>
  )
}
