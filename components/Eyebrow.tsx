import type { ReactNode } from 'react'

// The book's running-head style: a hairline rule above a small-caps,
// letter-spaced line in Bensham red. See docs/DESIGN.md.
export function Eyebrow({
  children,
  rule = true,
  className = '',
}: {
  children: ReactNode
  rule?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {rule && <div className="border-t border-rule mb-2" />}
      <span className="font-sans uppercase text-xs tracking-eyebrow text-bensham">
        {children}
      </span>
    </div>
  )
}
