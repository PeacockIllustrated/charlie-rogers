import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary'

// Metrics from docs/DESIGN.md: 1rem x padding, 0.625rem y, sans 14px medium,
// no border-radius, no shadow.
const base = 'inline-block font-sans text-small font-medium transition-colors'

const variants: Record<Variant, string> = {
  primary: 'bg-bensham text-paper px-4 py-2.5 hover:bg-bensham-deep',
  secondary:
    'border border-ink-soft text-ink px-4 py-2.5 hover:bg-ink-soft hover:text-paper',
  tertiary: 'text-ink-soft underline-offset-4 hover:underline',
}

export function Button({
  href,
  variant = 'primary',
  children,
  className = '',
}: {
  href?: string
  variant?: Variant
  children: ReactNode
  className?: string
}) {
  const cls = `${base} ${variants[variant]} ${className}`
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return <button className={cls}>{children}</button>
}
