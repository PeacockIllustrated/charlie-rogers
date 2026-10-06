import type { Metadata } from 'next'

import Link from 'next/link'
import { Eyebrow } from '@/components/Eyebrow'
import { Ledger } from '@/components/Ledger'
import { Roundel } from '@/components/Roundel'
import { BookFlip } from '@/components/BookFlip'
import { catalogueBySlug } from '@/lib/shop/catalogue'
import { bookFacts, bookDescription, bookContents } from '@/lib/content/book'
import { bookSamplePages } from '@/lib/content/bookSample'

export const metadata: Metadata = {
  title: 'The book',
  description:
    'Charlie Rogers, Pursued by Bulldozers, the first comprehensive account of the Gateshead painter who raced demolition crews to record Tyneside before it was flattened. Published by Littlecroft Publishing, 2025.',
  alternates: { canonical: '/book' },
}

const bookJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Charlie Rogers, Pursued by Bulldozers',
  isbn: '978-1-7393198-4-7',
  author: { '@type': 'Person', name: 'Brian Rankin' },
  about: { '@type': 'Person', name: 'Charlie Rogers' },
  publisher: { '@type': 'Organization', name: 'Littlecroft Publishing' },
  datePublished: '2025',
  numberOfPages: 123,
  bookFormat: 'https://schema.org/Hardcover',
  inLanguage: 'en-GB',
}

export default function BookPage() {
  const [lead, ...rest] = bookDescription

  const edition = catalogueBySlug('pursued-by-bulldozers-special-edition')
  const price = edition ? `£${(edition.price_pence / 100).toFixed(0)}` : null

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />

      {/* Title page */}
      <section className="bg-bensham text-paper">
        <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-paper/80">
              Littlecroft Publishing, 2025
            </p>
            <h1 className="mt-6 font-serif text-display">
              Charlie Rogers, <span className="italic">Pursued by Bulldozers</span>
            </h1>
            <p className="mt-8 max-w-reading font-serif text-lead text-paper/90">
              The first full account of his life and work, compiled by Brian
              Rankin. 123 pages, A4 hardback, printed in Gateshead.
            </p>
            {edition && (
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href={`/shop/${edition.slug}`}
                  className="inline-block bg-paper px-5 py-3 font-sans text-small font-medium text-bensham-deep transition-colors duration-colour hover:bg-mount"
                >
                  The special edition, {price}
                </Link>
                <a href="#inside" className="font-sans text-small text-paper underline-offset-4 hover:underline">
                  Look inside
                </a>
              </div>
            )}
          </div>
          <div className="flex justify-center lg:col-span-5">
            <Roundel size={280} tone="paper" title="The Charlie Rogers roundel" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-content px-6 pb-16">
        {/* The special edition */}
        {edition && (
          <section className="mt-14 grid gap-8 border border-rule border-t-2 border-t-bensham bg-paper-warm p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham lg:col-span-4">
              The special edition
            </p>
            <div className="lg:col-span-8">
              <p className="font-serif text-h2">
                One hundred copies, each embossed with the Charlie Rogers roundel
                and signed by Brian Rankin. Exclusive to this website.
              </p>
              <p className="mt-4 font-sans text-small text-ink-mute">
                {price}. The standard edition is available from Come View My Art
                Gallery, Sheriffs Highway, Low Fell, Gateshead.
              </p>
            </div>
          </section>
        )}

        {/* About */}
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>About the book</Eyebrow>
            <div className="mt-6 max-w-reading space-y-5 font-serif text-body text-ink-soft">
              <p className="text-lead text-ink">{lead}</p>
              {rest.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border border-rule bg-paper-warm p-6 lg:col-span-5 lg:p-8">
            <Ledger rows={bookFacts.map(({ label, value }) => ({ label, value }))} />
          </aside>
        </div>

        {/* Flip-book sample */}
        <section id="inside" className="mt-20 border border-rule bg-paper-warm p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
                Look inside
              </p>
              <h2 className="mt-4 font-serif text-h2">A sample of the opening chapter</h2>
              <p className="mt-4 font-serif text-body text-ink-soft">
                Turn the pages with the arrows, the dots, or by clicking the left
                and right of the book.
              </p>
            </div>
            <div className="lg:col-span-8">
              <BookFlip pages={bookSamplePages} />
            </div>
          </div>
        </section>

        {/* Contents */}
        <section className="mt-20 border border-rule bg-paper-warm p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham lg:col-span-4">
              What is inside
            </p>
            <ol className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
              {bookContents.map((item, i) => (
                <li key={i} className="flex items-baseline gap-4 border-b border-rule py-2.5">
                  <span className="w-6 shrink-0 font-sans text-xs text-ink-mute">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-body text-ink-soft">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}
