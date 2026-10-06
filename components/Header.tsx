'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Roundel } from './Roundel'

// Sticky, paper background, 1px bottom rule. The roundel and a wordmark in
// EB Garamond italic. Desktop: inline Jost small-caps nav. Mobile: a hamburger reveals a full-screen
// paper overlay with stacked serif links, per docs/DESIGN.md.
const nav = [
  { href: '/story', label: 'The story' },
  { href: '/work', label: 'The work' },
  { href: '/places', label: 'Places' },
  { href: '/people', label: 'People' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/book', label: 'The book' },
]

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the overlay whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll and wire Escape while the overlay is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-rule">
      <div className="mx-auto flex h-[4.5rem] max-w-content items-center justify-between gap-x-6 px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Charlie Rogers, home">
          <Roundel size={36} className="transition-transform duration-sheet ease-out group-hover:rotate-[24deg]" />
          <span className="font-serif text-[1.4375rem] italic leading-none">Charlie Rogers</span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main"
          className="hidden md:flex flex-wrap justify-end gap-x-4 gap-y-1 lg:gap-x-5"
        >
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(pathname, n.href) ? 'page' : undefined}
              className={`relative py-2 font-sans text-xs uppercase tracking-eyebrow transition-colors duration-colour hover:text-ink ${
                isActive(pathname, n.href) ? 'text-bensham' : 'text-ink-soft'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="md:hidden -mr-2.5 p-2.5 text-ink"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-paper md:hidden flex flex-col">
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-rule px-6">
            <span className="font-serif italic text-2xl leading-none">
              Charlie Rogers
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="-mr-2.5 p-2.5 text-ink"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Main menu"
            className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1"
          >
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(pathname, n.href) ? 'page' : undefined}
                className={`font-serif text-[28px] leading-tight py-3 border-b border-rule ${
                  isActive(pathname, n.href) ? 'text-bensham' : 'text-ink'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
