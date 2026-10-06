import { shareImage, OG_SIZE } from '@/lib/og'
import { catalogue, entryBySlug } from '@/lib/content/catalogue'

export const alt = 'A painting by Charlie Rogers'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return catalogue.map((e) => ({ slug: e.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = entryBySlug(slug)
  if (!e) {
    return shareImage({
      src: '/artwork/web/bensham-road-gateshead-1970.jpg',
      width: 1600,
      height: 1073,
      title: 'Charlie Rogers',
    })
  }
  return shareImage({
    src: e.image.src,
    width: e.image.width,
    height: e.image.height,
    title: e.title,
    detail: [e.year ?? 'Undated', e.medium].filter(Boolean).join(', '),
  })
}
