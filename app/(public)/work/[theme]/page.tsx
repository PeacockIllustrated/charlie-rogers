import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { CatalogueCard } from '@/components/CatalogueCard'
import { Gallery } from '@/components/Gallery'
import { entriesForTheme } from '@/lib/content/catalogue'
import { themes, themeBySlug, themePaintings } from '@/lib/content/themes'

export function generateStaticParams() {
  return themes.map((t) => ({ theme: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>
}): Promise<Metadata> {
  const { theme: slug } = await params
  const theme = themeBySlug(slug)
  if (!theme) return { title: 'Not found' }
  return {
    title: theme.title,
    description: theme.blurb,
    alternates: { canonical: `/work/${theme.slug}` },
  }
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ theme: string }>
}) {
  const { theme: slug } = await params
  const theme = themeBySlug(slug)
  if (!theme) notFound()

  const entries = [...entriesForTheme(theme.slug)].sort(
    (a, b) => (a.year ?? 9999) - (b.year ?? 9999),
  )
  const plates = themePaintings(theme)

  return (
    <div className="mx-auto max-w-content px-6 pb-16 pt-8">
      <BackLink href="/work">The work</BackLink>
      <header className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
            Book, pp. {theme.pageStart} to {theme.pageEnd}
          </p>
          <h1 className="mt-4 font-serif text-display">{theme.title}</h1>
        </div>
        <p className="font-serif text-lead text-ink-soft lg:col-span-5 lg:self-end">
          {theme.blurb}
        </p>
      </header>

      {entries.length > 0 && (
        <section className="mt-16" aria-labelledby="catalogued">
          <h2 id="catalogued" className="border-t border-rule pt-5 font-sans text-xs uppercase tracking-eyebrow text-bensham">
            Catalogued &middot; {entries.length}
          </h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => (
              <CatalogueCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-20 border border-rule bg-paper-warm p-6 sm:p-8 lg:p-10" aria-labelledby="reproduced">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="reproduced" className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
              Reproduced in the book &middot; {plates.length}
            </h2>
          </div>
          <p className="max-w-reading font-serif text-body text-ink-soft lg:col-span-8">
            Untitled plates from this chapter, shown at the size the book&rsquo;s
            scans allow and no larger. Titles, dates and media will follow as
            the originals are photographed.
          </p>
        </div>
        <Gallery paintings={plates} />
      </section>
    </div>
  )
}
