'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/shop/utils'

const SECTIONS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
]

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-rule bg-paper">
      <div className="px-5 py-5 border-b border-rule">
        <Link href="/admin" className="font-serif italic text-xl leading-none">
          Charlie Rogers
        </Link>
        <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
          Shop admin
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1" aria-label="Admin">
        {SECTIONS.map((s) => {
          const active = s.exact
            ? pathname === s.href
            : pathname.startsWith(s.href)
          return (
            <Link
              key={s.href}
              href={s.href}
              className={cn(
                'block px-3 py-2 font-sans text-small font-medium transition-colors',
                active
                  ? 'bg-bensham text-paper'
                  : 'text-ink-soft hover:bg-paper-warm',
              )}
            >
              {s.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-rule p-4">
        <p className="truncate font-sans text-xs text-ink-mute">{userEmail}</p>
        <form action="/api/admin/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="font-sans text-small text-ink-soft hover:text-bensham"
          >
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="mt-3 block font-sans text-xs text-ink-mute hover:text-bensham"
        >
          Back to site
        </Link>
      </div>
    </aside>
  )
}
