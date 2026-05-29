import Link from 'next/link'

// Small "back to index" affordance for detail pages. Tertiary weight, sans.
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-eyebrow text-ink-soft hover:text-bensham"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
        />
      </svg>
      {children}
    </Link>
  )
}
