// Painting and location status, shown as a small label, not a chip.
// Colours and emphasis from docs/DESIGN.md.
export type Status = 'extant' | 'demolished' | 'altered' | 'unknown'

const map: Record<Status, { label: string; cls: string }> = {
  extant: { label: 'Extant', cls: 'text-sage' },
  demolished: { label: 'Demolished', cls: 'text-bensham' },
  altered: { label: 'Altered', cls: 'text-ochre' },
  unknown: { label: 'Status unknown', cls: 'text-ink-mute' },
}

export function StatusLabel({ status }: { status: Status }) {
  const s = map[status]
  return (
    <span className={`font-sans text-xs uppercase tracking-eyebrow ${s.cls}`}>
      {s.label}
    </span>
  )
}
