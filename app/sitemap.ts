import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { catalogue } from '@/lib/content/catalogue'
import { places } from '@/lib/content/places'
import { people } from '@/lib/content/people'
import { themes } from '@/lib/content/themes'
import { CATALOGUE } from '@/lib/shop/catalogue'

// The public archive and the shop. Shop products come from the local
// catalogue, which the migrations keep in step with the live table.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/story', '/work', '/places', '/people', '/timeline', '/exhibitions', '/gallery', '/book', '/shop']

  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...themes.map((t) => ({ url: `${SITE_URL}/work/${t.slug}` })),
    ...catalogue.map((e) => ({ url: `${SITE_URL}/catalogue/${e.slug}` })),
    ...places.map((p) => ({ url: `${SITE_URL}/places/${p.slug}` })),
    ...people.map((p) => ({ url: `${SITE_URL}/people/${p.slug}` })),
    ...CATALOGUE.filter((p) => p.status === 'published').map((p) => ({ url: `${SITE_URL}/shop/${p.slug}` })),
  ]
}
