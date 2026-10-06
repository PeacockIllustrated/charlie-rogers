import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { Ledger } from '@/components/Ledger'
import { Plate } from '@/components/Plate'
import { RaceLine } from '@/components/RaceLine'
import {
  catalogue,
  entryBySlug,
  paintedYears,
  ORIGIN_LABEL,
  type Entry,
} from '@/lib/content/catalogue'
import { placeBySlug } from '@/lib/content/places'
import { themeBySlug } from '@/lib/content/themes'
import { catalogueBySlug } from '@/lib/shop/catalogue'

// A catalogue entry: the painting on its mount, the ledger beside it, and
// where it sits in the race. One page per painting, so each can be linked,
// cited and shared.

export function generateStaticParams() {
  return catalogue.map((e) => ({ slug: e.slug }))
}

function dateLine(e: Entry): string {
  return e.year ? String(e.year) : 'Undated'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const e = entryBySlug(slug)
  if (!e) return { title: 'Not found' }
  const title = e.year ? `${e.title}, ${e.year}` : e.title
  const description = `${e.title} by Charlie Rogers${e.year ? `, ${e.year}` : ''}${
    e.medium ? `. ${e.medium}` : ''
  }. ${e.alt}`
  return {
    title,
    description,
    alternates: { canonical: `/catalogue/${e.slug}` },
    openGraph: {
      title: `${title}, Charlie Rogers`,
      description,
      type: 'article',
    },
  }
}

const titleSourceLabel = {
  caption: 'the book’s caption',
  inscription: 'Charlie’s inscription on the painting',
  'location key': 'the book’s location key, page 27',
} as const

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const e = entryBySlug(slug)
  if (!e) notFound()

  const i = catalogue.indexOf(e)
  const prev = catalogue[(i - 1 + catalogue.length) % catalogue.length]
  const next = catalogue[(i + 1) % catalogue.length]
  const place = e.place ? placeBySlug(e.place) : undefined
  const theme = e.theme ? themeBySlug(e.theme) : undefined
  const product = e.shopSlug ? catalogueBySlug(e.shopSlug) : null

  const source =
    e.origin === 'book' && e.bookPage
      ? `${ORIGIN_LABEL.book}, p. ${e.bookPage}`
      : ORIGIN_LABEL[e.origin]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: e.title,
    creator: { '@type': 'Person', name: 'Charlie Rogers' },
    ...(e.year ? { dateCreated: String(e.year) } : {}),
    ...(e.medium ? { artMedium: e.medium } : {}),
    image: e.image.src,
    description: e.alt,
    copyrightHolder: { '@type': 'Person', name: 'Charles Rogers Junior' },
  }

  return (
    <article className="mx-auto max-w-content px-6 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackLink href={theme ? `/work/${theme.slug}` : '/work'}>
        {theme ? theme.title : 'The work'}
      </BackLink>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <Plate
            src={e.image.src}
            width={e.image.width}
            height={e.image.height}
            alt={e.alt}
            priority
            sizes="(min-width: 1024px) 62vw, 100vw"
          />
        </div>

        <div className="lg:col-span-4">
          <div className="border border-rule bg-paper-warm p-6 lg:sticky lg:top-24 lg:p-8">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              Charlie Rogers
            </p>
            <h1 className="mt-4 font-serif text-h1">{e.title}</h1>
            <p className="mt-2 font-serif text-lead italic text-ink-soft">{dateLine(e)}</p>

            {e.note && (
              <p className="mt-6 font-serif text-body text-ink-soft">{e.note}</p>
            )}

            <Ledger
              className="mt-8"
              rows={[
                { label: 'Medium', value: e.medium ?? 'Not recorded' },
                { label: 'Size', value: e.dimensions },
                {
                  label: 'Place',
                  value: place && (
                    <Link href={`/places/${place.slug}`} className="underline decoration-rule underline-offset-4 hover:text-bensham hover:decoration-bensham">
                      {place.name}
                    </Link>
                  ),
                },
                {
                  label: 'Chapter',
                  value: theme && (
                    <Link href={`/work/${theme.slug}`} className="underline decoration-rule underline-offset-4 hover:text-bensham hover:decoration-bensham">
                      {theme.title}
                    </Link>
                  ),
                },
                { label: 'Image', value: source },
                {
                  label: 'Title from',
                  value: e.titleSource ? titleSourceLabel[e.titleSource] : undefined,
                },
              ]}
            />

            {e.mediumNote && (
              <p className="mt-4 font-sans text-small text-ink-mute">{e.mediumNote}</p>
            )}

            {product && (
              <div className="mt-8">
                <Link
                  href={`/shop/${product.slug}`}
                  className="inline-block border border-ink-soft px-4 py-2.5 font-sans text-small font-medium text-ink transition-colors duration-colour hover:bg-ink-soft hover:text-paper"
                >
                  Enquire about this painting
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {place && (
        <section className="mt-16 border border-rule bg-paper-warm p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-14">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham lg:col-span-4">
              {place.name}
            </p>
            <div className="lg:col-span-8">
              <RaceLine
                size="large"
                painted={paintedYears(place)}
                status={place.status}
                cleared={place.cleared}
              />
            </div>
          </div>
        </section>
      )}

      {e.photograph && (
        <section className="mt-16 border-t border-rule pt-6">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
                The scene itself
              </p>
              <p className="mt-4 font-serif text-body text-ink-soft">{e.photograph.caption}.</p>
            </div>
            <div className="lg:col-span-8">
              <Plate
                src={e.photograph.src}
                width={e.photograph.width}
                height={e.photograph.height}
                alt={`A photograph of the scene in ${e.title}`}
                caption={`Photograph reproduced in the book, p. ${e.photograph.bookPage}`}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          </div>
        </section>
      )}

      <nav aria-label="More from the catalogue" className="mt-16 grid grid-cols-2 gap-3">
        <Link href={`/catalogue/${prev.slug}`} className="group border border-rule bg-paper p-5 transition-colors duration-colour hover:border-ink-mute sm:p-6">
          <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Previous</span>
          <span className="mt-2 block font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
            {prev.title}
          </span>
        </Link>
        <Link href={`/catalogue/${next.slug}`} className="group border border-rule bg-paper p-5 text-right transition-colors duration-colour hover:border-ink-mute sm:p-6">
          <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Next</span>
          <span className="mt-2 block font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
            {next.title}
          </span>
        </Link>
      </nav>
    </article>
  )
}
