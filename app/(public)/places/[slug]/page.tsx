import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { CatalogueCard } from '@/components/CatalogueCard'
import { Plate } from '@/components/Plate'
import { Prose } from '@/components/Prose'
import { RaceLine } from '@/components/RaceLine'
import { StatusLabel } from '@/components/StatusLabel'
import { entriesForPlace, paintedYears } from '@/lib/content/catalogue'
import { places, placeBySlug, locationLine } from '@/lib/content/places'
import { extract } from '@/lib/paintings'

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }))
}

// Photographs the book reproduces of a place, shown beside Charlie's painting
// of it. Cotfield Street is gone; this is one of the few records of it.
const photographs: Record<string, { key: string; caption: string }> = {
  'cotfield-street': {
    key: 'page_031_img_001',
    caption: 'Cotfield Street, Bensham, photographed. Reproduced in the book, p. 31',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) return { title: 'Not found' }
  return {
    title: place.name,
    description: place.paragraphs[0],
    alternates: { canonical: `/places/${place.slug}` },
    ...(place.image ? { openGraph: { images: [place.image] } } : {}),
  }
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) notFound()

  const entries = entriesForPlace(place.slug)
  // The lead image is the largest catalogue entry for the place, so the
  // biggest honest reproduction leads; otherwise the place's own image.
  const lead = [...entries].sort((a, b) => b.image.width - a.image.width)[0]
  const others = entries.filter((e) => e !== lead)
  const photo = photographs[place.slug]
  const photoImage = photo ? extract(photo.key) : undefined
  const placeImage = place.image ? extract(place.image.split('/').pop()?.replace('.jpg', '') ?? '') : undefined

  return (
    <article className="mx-auto max-w-content px-6 pb-16 pt-8">
      <BackLink href="/places">All places</BackLink>

      <header className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            {locationLine(place)}
          </p>
          <h1 className="mt-4 font-serif text-display">{place.name}</h1>
        </div>
        <div className="border border-rule bg-paper-warm p-5 lg:col-span-5 lg:self-end">
          <StatusLabel status={place.status} />
          <RaceLine
            className="mt-4"
            size="large"
            painted={paintedYears(place)}
            status={place.status}
            cleared={place.cleared}
          />
        </div>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          {lead ? (
            <Plate
              src={lead.image.src}
              width={lead.image.width}
              height={lead.image.height}
              alt={lead.alt}
              priority
              caption={
                <Link href={`/catalogue/${lead.slug}`} className="font-serif text-body italic text-ink-soft hover:text-bensham">
                  {lead.title}
                  {lead.year ? `, ${lead.year}` : ''}
                </Link>
              }
            />
          ) : place.image ? (
            <Plate
              src={place.image}
              width={placeImage?.width ?? 600}
              height={placeImage?.height ?? 450}
              alt={`${place.name}, painted by Charlie Rogers`}
              priority
              caption="Reproduced in the book"
            />
          ) : null}
        </div>
        <div className="lg:col-span-5">
          <Prose paragraphs={place.paragraphs} />
        </div>
      </div>

      {photo && photoImage && (
        <section className="mt-20 border-t border-rule pt-6">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
                The street itself
              </p>
              <p className="mt-4 font-serif text-body text-ink-soft">
                The book prints photographs of the streets Charlie painted beside
                the paintings themselves, so the two records can be read
                together.
              </p>
            </div>
            <div className="lg:col-span-7">
              <Plate
                src={photoImage.web}
                width={photoImage.width}
                height={photoImage.height}
                alt={`A photograph of ${place.name}`}
                caption={photo.caption}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-20 border-t border-rule pt-6">
          <h2 className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            More of {place.name} in the catalogue
          </h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <CatalogueCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
