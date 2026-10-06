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
    <footer className="mt-16">
      <Skyline />
      <section className="bg-bensham-deep text-paper">
        <div className="mx-auto grid max-w-content items-center gap-10 px-6 py-16 md:grid-cols-12 lg:py-20">
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
              className="inline-block py-2.5 font-sans text-small text-paper underline-offset-4 hover:underline"
            >
              About the book
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="font-serif text-h3 italic">Charlie Rogers</div>
            <p className="mt-2 max-w-reading font-serif text-body text-ink-soft">
              Self-taught Gateshead painter, 1930 to 2020. He documented the back
              lanes, pubs and churches of Tyneside, often days before the
              bulldozers arrived.
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-6">
            <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    // py-1.5 keeps the tap target above the WCAG 2.5.8
                    // minimum of 24px.
                    className="inline-block py-1.5 font-sans text-xs uppercase tracking-eyebrow text-ink-soft transition-colors duration-colour hover:text-bensham"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-rule pt-6 font-sans text-xs text-ink-mute">
          Artwork &copy; Charles Rogers Junior. Built around the book by Brian
          Rankin, Littlecroft Publishing, 2025.
        </p>
      </div>
    </footer>
  )
}
