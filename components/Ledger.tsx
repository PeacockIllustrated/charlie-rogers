import type { ReactNode } from 'react'

// The catalogue ledger: label and value in two columns, hairline between rows,
// as a museum catalogue sets an entry. Rows with no value are left out rather
// than shown as a dash.
export function Ledger({
  rows,
  className = '',
}: {
  rows: { label: string; value?: ReactNode }[]
  className?: string
}) {
  return (
    <dl className={`border-t border-rule ${className}`}>
      {rows
        .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
        .map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-rule py-3"
          >
            <dt className="pt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              {r.label}
            </dt>
            <dd className="font-serif text-body text-ink">{r.value}</dd>
          </div>
        ))}
    </dl>
  )
}
