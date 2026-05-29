import type { Metadata } from 'next'

import { SectionHeading } from '@/components/SectionHeading'
import { Prose } from '@/components/Prose'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { bookFacts, bookDescription, bookContents } from '@/lib/content/book'

export const metadata: Metadata = {
  title: 'The book',
  description:
    'Charlie Rogers, Pursued by Bulldozers, the first comprehensive account of the Gateshead painter who raced demolition crews to record Tyneside before it was flattened. Published by Littlecroft Publishing, 2025.',
}

export default function BookPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Littlecroft Publishing, 2025"
        title="Charlie Rogers, Pursued by Bulldozers"
      />

      <div className="mt-12 grid lg:grid-cols-2 gap-12">
        {/* Left column: painting image and book facts */}
        <div>
          <div className="mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/paintings/web/page_027_img_000.jpg"
              alt="Saltwell Park, painted by Charlie Rogers"
              loading="lazy"
              className="block w-full h-auto"
            />
            <p className="font-sans text-xs text-ink-mute mt-2 tracking-eyebrow uppercase">
              Saltwell Park, a subject Charlie returned to often
            </p>
          </div>

          <dl className="border-t border-rule">
            {bookFacts.map(({ label, value }) => (
              <div
                key={label}
                className="flex gap-4 py-3 border-b border-rule"
              >
                <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute w-32 shrink-0 pt-0.5">
                  {label}
                </dt>
                <dd className="font-serif text-body text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column: description and buy block */}
        <div>
          <Prose paragraphs={bookDescription} />

          <div className="mt-10 border-t border-rule pt-8">
            <Eyebrow rule={false}>Buy the book</Eyebrow>
            <div className="mt-4">
              <Button href="#order" variant="primary">
                Buy the book
              </Button>
            </div>
            <p
              id="order"
              className="font-sans text-small text-ink-mute mt-4 max-w-reading"
            >
              Online ordering is coming soon. The book is currently available
              through{' '}
              <strong className="font-medium text-ink">
                Come View My Art Gallery
              </strong>
              , Sheriffs Highway, Low Fell, Gateshead. Price on request.
            </p>
          </div>
        </div>
      </div>

      {/* Contents list */}
      <div className="mt-16 border-t border-rule pt-10">
        <h2 className="font-serif text-h2 mb-8">What is inside</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 max-w-content">
          {bookContents.map((item, i) => (
            <li key={i} className="flex gap-3 items-baseline">
              <span className="font-sans text-xs text-ink-mute tabular-nums w-5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-body text-ink-soft">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
