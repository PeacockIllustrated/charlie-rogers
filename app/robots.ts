import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// The shop and the styleguide already carry noindex on the page. They are
// disallowed here too so crawlers do not spend time on them. The admin is
// behind a login, but there is no reason to advertise it either.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/shop', '/styleguide'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
