// Brian Rankin sent this on 11 June 2026 with the instruction "Please include
// this on the new website", and sent it again the same day. It is the printer's
// own description, from Paul Wright at the Biscuit Factory.
//
// Reproduced as written, with one correction: Brian's email has "extreme
// temperature's", which is a plain typographical slip rather than a turn of
// phrase, so the apostrophe is dropped here. Everything else is his wording.
//
// The size, the two editions and free delivery come from his email of 12
// October 2026; see lib/shop/prints.ts. The blind stamp is from his email of
// 23 October 2026.
import Image from 'next/image'
import { PRINT_DELIVERY, PRINT_EDITIONS, PRINT_SIZE, PRINT_STAMP } from '@/lib/shop/prints'
import { formatPence } from '@/lib/shop/utils'

export function PrintSpecifications() {
  return (
    <section
      className="max-w-reading border border-rule bg-paper-warm p-6 sm:p-8"
      aria-labelledby="print-specifications"
    >
      {/* The eyebrow is the heading itself, rather than a span with a hidden
          heading beside it, so a screen reader announces it once. */}
      <h2
        id="print-specifications"
        className="mb-4 font-sans text-xs uppercase tracking-eyebrow text-bensham"
      >
        Print specifications
      </h2>

      <dl className="mb-6 divide-y divide-rule border-y border-rule">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
          <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">Size</dt>
          <dd className="font-serif text-body text-ink">{PRINT_SIZE}</dd>
        </div>
        {PRINT_EDITIONS.map((e) => (
          <div key={e.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
            <dt className="min-w-0">
              <span className="block font-serif text-body text-ink">{e.name}</span>
              <span className="block font-sans text-small text-ink-mute">{e.detail}</span>
            </dt>
            <dd className="font-serif text-body text-bensham">{formatPence(e.price_pence)}</dd>
          </div>
        ))}
        <div className="py-3">
          <dt className="sr-only">Blind stamp</dt>
          <dd className="font-serif text-body text-ink">{PRINT_STAMP}</dd>
        </div>
        <div className="py-3">
          <dt className="sr-only">Delivery</dt>
          <dd className="font-serif text-body text-ink">{PRINT_DELIVERY}</dd>
        </div>
      </dl>

      {/* Brian Rankin's photographs of the limited edition, 13 October 2026:
          the print in its mount, and the certificate that comes with it. */}
      <figure className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Image
            src="/artwork/shop/street-meeting-gateshead-limited-edition-mounted.jpg"
            width={1600}
            height={1253}
            alt="A limited edition print in its white mount, with the Charlie Rogers Collection label on the wine red corner."
            sizes="(min-width: 640px) 18rem, 45vw"
            className="block aspect-[4/5] w-full object-cover"
          />
          <Image
            src="/artwork/shop/street-meeting-gateshead-certificate.jpg"
            width={1131}
            height={1600}
            alt="The certificate of authenticity that comes with each limited edition print."
            sizes="(min-width: 640px) 18rem, 45vw"
            className="block aspect-[4/5] w-full object-cover object-top"
          />
        </div>
        <figcaption className="mt-2 font-sans text-xs text-ink-mute">
          The limited edition, mounted, with its certificate. Shown with Street Meeting, Gateshead.
        </figcaption>
      </figure>

      <p className="font-serif text-body text-ink-soft">
        Each of our high quality prints is made using Archival Pigment (Giclée)
        Expression Smooth 300gsm Art Paper. We use professional-grade, archival
        pigment ink specifically designed for fine art printing.
      </p>

      <p className="mt-4 font-serif text-body text-ink-soft">
        Each print should be treated the same as an original painting. Prints
        purchased from this website should not be placed in rooms with extreme
        temperatures or direct sunlight.
      </p>

      <p className="mt-4 font-sans text-small text-ink-mute">
        Prints are supplied by fine art printer Paul Wright at the Biscuit Factory.
      </p>
    </section>
  )
}
