import type { Metadata } from 'next'

import { SectionHeading } from '@/components/SectionHeading'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { BookFlip } from '@/components/BookFlip'
import { bookFacts, bookDescription, bookContents } from '@/lib/content/book'
import { bookSamplePages } from '@/lib/content/bookSample'

export const metadata: Metadata = {
  title: 'The book',
  description:
    'Charlie Rogers, Pursued by Bulldozers, the first comprehensive account of the Gateshead painter who raced demolition crews to record Tyneside before it was flattened. Published by Littlecroft Publishing, 2025.',
}

export default function BookPage() {
  const [lead, ...rest] = bookDescription

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Littlecroft Publishing, 2025"
        title="Charlie Rogers, Pursued by Bulldozers"
        intro={lead}
      />

      {/* Flip-book sample, the centrepiece. */}
      <section className="mt-14">
        <Eyebrow>Look inside</Eyebrow>
        <h2 className="font-serif text-h3 mt-3 max-w-reading">
          A sample of the opening chapter
        </h2>
        <p className="font-serif text-body text-ink-soft mt-2 max-w-reading">
          Turn the pages with the arrows, the dots, or by clicking the left and
          right of the book.
        </p>
        <div className="mt-8 max-w-4xl">
          <BookFlip pages={bookSamplePages} />
        </div>
      </section>

      {/* About and buy. */}
      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Eyebrow>About the book</Eyebrow>
          <div className="mt-4 max-w-reading font-serif text-body-lg text-ink-soft space-y-5">
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <aside>
          <dl className="border-t border-rule">
            {bookFacts.map(({ label, value }) => (
              <div key={label} className="flex gap-4 py-3 border-b border-rule">
                <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute w-28 shrink-0 pt-0.5">
                  {label}
                </dt>
                <dd className="font-serif text-body text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <Eyebrow rule={false}>Where to buy</Eyebrow>
            <p className="font-serif text-body text-ink-soft mt-3">
              The book is available through Come View My Art Gallery, Sheriffs
              Highway, Low Fell, Gateshead. Price on request.
            </p>
            <p className="font-sans text-small text-ink-mute mt-3">
              Online ordering is coming soon.
            </p>
            <div className="mt-5">
              <Button href="/places/bigg-market-newcastle" variant="secondary">
                See where it began
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Contents. */}
      <div className="mt-16 border-t border-rule pt-10">
        <Eyebrow>What is inside</Eyebrow>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
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
