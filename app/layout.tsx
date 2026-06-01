import type { Metadata } from 'next'
import { EB_Garamond, Inter } from 'next/font/google'
import './globals.css'

// Root layout: html/body, fonts, global styles only. The public site chrome
// (header, footer) lives in app/(public)/layout.tsx so that /admin and /shop
// checkout surfaces can present their own chrome.

// EB Garamond stands in for the book's Bembo; Inter for its Futura running heads.
const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Charlie Rogers, Pursued by Bulldozers',
    template: '%s · Charlie Rogers',
  },
  description:
    'The life and work of Charlie Rogers, 1930 to 2020, the self-taught Gateshead painter who documented Tyneside before the bulldozers arrived.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-serif bg-paper text-ink min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
