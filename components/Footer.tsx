import Link from 'next/link'
import { Roundel } from './Roundel'
import { Skyline } from './graphics/Skyline'
import { catalogueBySlug } from '@/lib/shop/catalogue'

const footerLinks = [
  { href: '/story', label: 'The story' },
  { href: '/work', label: 'The work' },
  { href: '/places', label: 'Places' },
  { href: '/people', label: 'People' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/book', label: 'The book' },
]

// Every page closes on the book, once, here, rather than with a callout
// repeated at the foot of each page.
export function Footer() {
  const edition = catalogueBySlug('pursued-by-bulldozers-special-edition')
  return (
    // The street at dusk runs straight down into the footer: one deep red
    // block, the book first, then the way around the site.
    <footer className="mt-16 bg-bensham-deep text-paper">
      <div className="bg-paper">
        <Skyline />
      </div>
      <div className="border-t border-[#4A1010] bg-[#4A1010]">
        <div className="mx-auto grid max-w-content items-center gap-10 px-6 py-14 md:grid-cols-12 lg:py-20">
          <div className="md:col-span-3">
            <Roundel size={168} tone="paper" title="The Charlie Rogers roundel, embossed on every copy of the special edition" />
          </div>
          <div className="md:col-span-5">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-paper/75">
              The book
            </p>
            <p className="mt-3 font-serif text-h2">
              Charlie Rogers, <span className="italic">Pursued by Bulldozers</span>
            </p>
            <p className="mt-3 font-serif text-body text-paper/85">
              Compiled by Brian Rankin. Littlecroft Publishing, 2025. The special
              edition is one hundred copies, each embossed with the roundel and
              signed by the author, available only here.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-4 md:justify-end">
            {edition && (
              <Link
                href={`/shop/${edition.slug}`}
                className="inline-block bg-paper px-4 py-2.5 font-sans text-small font-medium text-bensham-deep transition-colors duration-colour hover:bg-mount"
              >
                Special edition, &pound;{(edition.price_pence / 100).toFixed(0)}
              </Link>
            )}
            <Link
              href="/book"
              className="inline-block border border-paper/40 px-4 py-2.5 font-sans text-small text-paper transition-colors duration-colour hover:border-paper"
            >
              About the book
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 pb-10 pt-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-serif text-display-2 italic leading-none">Charlie Rogers</p>
            <p className="mt-3 font-sans text-xs uppercase tracking-eyebrow text-paper/70">
              Gateshead, 1930 to 2020
            </p>
            <p className="mt-5 max-w-reading font-serif text-body text-paper/85">
              Self-taught painter of the back lanes, pubs and churches of
              Tyneside, often days before the bulldozers arrived.
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-6">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-paper/70">
              The archive
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 border-t border-paper/20 sm:grid-cols-3">
              {footerLinks.map((l) => (
                <li key={l.href} className="border-b border-paper/20">
                  <Link
                    href={l.href}
                    // py-3 keeps the tap target above the WCAG 2.5.8
                    // minimum of 24px.
                    className="group flex items-center justify-between py-3 font-serif text-body text-paper transition-colors duration-colour hover:text-mount"
                  >
                    {l.label}
                    <span aria-hidden="true" className="font-sans text-xs text-paper/50 transition-transform duration-colour group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-14 border-t border-paper/20 pt-6 font-sans text-xs text-paper/70">
          Artwork &copy; Charles Rogers Junior. Built around the book by Brian
          Rankin, Littlecroft Publishing, 2025.
        </p>
      </div>
    </footer>
  )
}
