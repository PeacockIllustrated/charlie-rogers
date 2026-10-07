import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { catalogue } from '@/lib/content/catalogue'
import { places } from '@/lib/content/places'
import { people } from '@/lib/content/people'
import { themes } from '@/lib/content/themes'

// The public archive only. The shop is left out while it is noindex and
// unlinked (see docs/SHOP.md); add it here in the same change that opens it.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/story', '/work', '/places', '/people', '/timeline', '/exhibitions', '/book']

  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...themes.map((t) => ({ url: `${SITE_URL}/work/${t.slug}` })),
    ...catalogue.map((e) => ({ url: `${SITE_URL}/catalogue/${e.slug}` })),
    ...places.map((p) => ({ url: `${SITE_URL}/places/${p.slug}` })),
    ...people.map((p) => ({ url: `${SITE_URL}/people/${p.slug}` })),
  ]
}
