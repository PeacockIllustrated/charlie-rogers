import type { Metadata } from 'next'
import { EB_Garamond, Jost } from 'next/font/google'
import './globals.css'

// Root layout: html/body, fonts, global styles only. The public site chrome
// (header, footer) lives in app/(public)/layout.tsx so that /admin and /shop
// checkout surfaces can present their own chrome.

// EB Garamond stands in for the book's Bembo, Jost for its Futura running
// heads. Jost is an open-licence Futura revival; Inter, which it replaces, had
// none of Futura's geometry. Only the weights the site sets are loaded, and
// only the serif is preloaded, since it carries the first paint.
const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const sans = Jost({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

// Set NEXT_PUBLIC_SITE_URL to the production origin so canonical and Open
// Graph URLs resolve absolutely. Vercel previews fall back to their own URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'Charlie Rogers, Pursued by Bulldozers',
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image' },
  title: {
    default: 'Charlie Rogers, Pursued by Bulldozers',
    template: '%s · Charlie Rogers',
  },
  description:
    'The life and work of Charlie Rogers, 1930 to 2020, the self-taught Gateshead painter who documented Tyneside before the bulldozers arrived.',
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Charlie Rogers',
  alternateName: 'Charles Henry Rogers',
  birthDate: '1930-01-16',
  birthPlace: 'Gateshead',
  deathDate: '2020-04-27',
  deathPlace: 'Gateshead',
  jobTitle: 'Painter',
  description:
    'Self-taught Gateshead painter who recorded the back lanes, pubs, churches and corner shops of Tyneside from 1964 to 2020, often days before they were demolished.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-serif bg-paper text-ink min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          // Charlie as a Person, the highest-value structured data for the site.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
