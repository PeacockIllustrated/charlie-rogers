import Image from 'next/image'
import { gallery, galleryAddress, galleryMapHref } from '@/lib/content/gallery'

// Brian Rankin's gallery: the photograph, his text, and how to reach it. Used
// on the gallery page and the shop. Brian asked on 23 October 2026 for the
// gallery's details to be on the site so customers can order through it
// before Christmas, until the shop takes orders online, so the ordering line
// is shown wherever the block appears.
export function GalleryVisit({
  as = 'h2',
  id = 'gallery',
}: {
  as?: 'h1' | 'h2'
  id?: string
}) {
  const Heading = as
  return (
    <section
      aria-labelledby={id}
      className="border border-rule border-t-2 border-t-bensham bg-paper-warm"
    >
      {/* Wide on desktop, cropped to keep the fascia and the windows; the
          whole shopfront on a phone. */}
      <figure className="min-w-0">
        <Image
          src={gallery.photo.src}
          width={gallery.photo.width}
          height={gallery.photo.height}
          alt={gallery.photo.alt}
          sizes="(min-width: 1200px) 73rem, 100vw"
          className="block h-auto w-full lg:aspect-[2/1] lg:object-cover lg:object-[50%_30%]"
        />
      </figure>

      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
        <div className="min-w-0 lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            Visit the gallery
          </p>
          <Heading
            id={id}
            className={as === 'h1' ? 'mt-3 font-serif text-display-2' : 'mt-3 font-serif text-h2'}
          >
            {gallery.heading}
          </Heading>
          {gallery.text.map((t) => (
            <p key={t} className="mt-4 max-w-reading font-serif text-body-lg text-ink-soft">
              {t}
            </p>
          ))}
        </div>

        <div className="min-w-0 lg:col-span-5">
          <p className="border-l-2 border-bensham pl-4 font-serif text-body text-ink">
            Until orders can be taken on this website, the book, prints and
            greeting cards can be ordered through the gallery. Call, email or
            call in.
          </p>

          <dl className="mt-6 divide-y divide-rule border-y border-rule">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
              <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Address</dt>
              <dd className="font-serif text-body text-ink">
                <a href={galleryMapHref} className="text-bensham underline underline-offset-4 hover:text-bensham-deep" rel="noopener noreferrer" target="_blank">
                  {galleryAddress}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
              <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Telephone</dt>
              <dd className="font-serif text-body text-ink">
                <a href={gallery.phoneHref} className="tabular-nums text-bensham underline underline-offset-4 hover:text-bensham-deep">
                  {gallery.phone}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
              <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Email</dt>
              <dd className="min-w-0 break-words font-serif text-body text-ink">
                <a href={`mailto:${gallery.email}`} className="text-bensham underline underline-offset-4 hover:text-bensham-deep">
                  {gallery.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
              <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Open</dt>
              <dd className="font-serif text-body text-ink">{gallery.hours}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
