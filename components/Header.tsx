import Link from 'next/link'

// Sticky, paper background, 1px bottom rule. Wordmark in EB Garamond italic,
// nav in Inter small caps. A full-screen mobile overlay (client component) is a
// later task; for now the nav wraps. See docs/DESIGN.md.
const nav = [
  { href: '/story', label: 'The story' },
  { href: '/work', label: 'The work' },
  { href: '/places', label: 'Places' },
  { href: '/people', label: 'People' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/book', label: 'The book' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-rule">
      <div className="mx-auto max-w-content px-6 min-h-16 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <Link href="/" className="font-serif italic text-2xl leading-none">
          Charlie Rogers
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 lg:gap-x-5">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-sans uppercase text-[13px] tracking-eyebrow text-ink-soft hover:text-ink py-2"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
