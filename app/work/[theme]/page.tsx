import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SectionHeading } from '@/components/SectionHeading'
import { Gallery } from '@/components/Gallery'
import { BookCallout } from '@/components/BookCallout'
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
  return { title: theme.title, description: theme.blurb }
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ theme: string }>
}) {
  const { theme: slug } = await params
  const theme = themeBySlug(slug)
  if (!theme) notFound()

  const paintings = themePaintings(theme)
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading as="h1" eyebrow="The work" title={theme.title} intro={theme.blurb} />
      <Gallery paintings={paintings} />
      <BookCallout />
    </div>
  )
}
