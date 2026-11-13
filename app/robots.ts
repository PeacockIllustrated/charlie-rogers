import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// The shop is open to search engines from 13 November 2026, for Christmas.
// Its basket, checkout and order pages carry noindex and are disallowed here,
// as is the styleguide. The admin is behind a login, but there is no reason
// to advertise it either.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/shop/basket', '/shop/checkout', '/shop/order', '/styleguide'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
