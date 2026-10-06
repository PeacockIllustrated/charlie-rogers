import type { Metadata } from 'next'
import Link from 'next/link'
import { CatalogueCard } from '@/components/CatalogueCard'
import { catalogue, entriesForTheme, type Entry } from '@/lib/content/catalogue'
import { themes, themePaintings } from '@/lib/content/themes'

export const metadata: Metadata = {
  title: 'The work',
  description:
    'The catalogue of Charlie Rogers paintings, by decade, and the chapters of Pursued by Bulldozers: Gateshead, Newcastle, Paris, family, characters and more.',
  alternates: { canonical: '/work' },
}

// Dated entries by decade, oldest first; undated entries close the catalogue.
function byDecade(entries: Entry[]): { label: string; entries: Entry[] }[] {
  const groups = new Map<string, Entry[]>()
  const sorted = [...entries].sort(
    (a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title),
  )
  for (const e of sorted) {
    const label = e.year ? `${Math.floor(e.year / 10) * 10}s` : 'Undated'
    groups.set(label, [...(groups.get(label) ?? []), e])
  }
  return [...groups].map(([label, entries]) => ({ label, entries }))
}

export default function WorkIndex() {
  const untitled = themes.reduce((n, t) => n + themePaintings(t).length, 0)
  const decades = byDecade(catalogue)

  return (
    <div className="mx-auto max-w-content px-6 pb-16 pt-12">
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            The catalogue
          </p>
          <h1 className="mt-4 font-serif text-display">The work</h1>
        </div>
        <p className="font-serif text-lead text-ink-soft lg:col-span-5 lg:self-end">
          Charlie made around a thousand paintings and drawings in fifty-six
          years. {catalogue.length} are catalogued here by title, with {untitled}{' '}
          more untitled plates from the book shown in their chapters.
        </p>
      </header>

      <nav aria-label="Decades" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-y border-rule py-4">
        {decades.map((d) => (
          <a
            key={d.label}
            href={`#d-${d.label}`}
            className="py-1 font-sans text-small text-ink-soft hover:text-bensham"
          >
            {d.label}
            <span className="ml-1.5 text-xs text-ink-mute">{d.entries.length}</span>
          </a>
        ))}
        <a href="#chapters" className="ml-auto py-1 font-sans text-small text-ink-soft hover:text-bensham">
          The book&rsquo;s chapters
        </a>
      </nav>

      {decades.map((d) => (
        <section key={d.label} id={`d-${d.label}`} className="mt-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="font-serif text-h1 text-bensham lg:col-span-2" style={{ fontVariantNumeric: 'lining-nums' }}>
              {d.label}
            </h2>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-10 lg:grid-cols-3">
              {d.entries.map((e) => (
                <CatalogueCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="chapters" className="mt-24">
        <div className="grid gap-8 border border-rule bg-paper-warm p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-4">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              By chapter
            </p>
            <h2 className="mt-4 font-serif text-h2">The book&rsquo;s chapters</h2>
            <p className="mt-4 font-serif text-body text-ink-soft">
              The work as the book arranges it. Each chapter shows its catalogued
              paintings first, then the untitled plates it reproduces.
            </p>
          </div>
          <ol className="border border-rule bg-paper lg:col-span-8">
            {themes.map((t) => {
              const named = entriesForTheme(t.slug).length
              const plates = themePaintings(t).length
              return (
                <li key={t.slug} className="border-b border-rule last:border-b-0">
                  <Link
                    href={`/work/${t.slug}`}
                    className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 px-5 py-5 transition-colors duration-colour hover:bg-mount sm:grid-cols-[1fr_9rem_7rem]"
                  >
                    <span>
                      <span className="block font-serif text-h3 transition-colors duration-colour group-hover:text-bensham">
                        {t.title}
                      </span>
                      <span className="mt-1 block max-w-reading font-serif text-small text-ink-mute">
                        {t.blurb}
                      </span>
                    </span>
                    <span className="hidden font-sans text-xs text-ink-mute sm:block">
                      Book, pp. {t.pageStart} to {t.pageEnd}
                    </span>
                    <span className="text-right font-sans text-xs text-ink-soft">
                      {named > 0 && <span className="block">{named} catalogued</span>}
                      <span className="block text-ink-mute">{plates} untitled</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}
