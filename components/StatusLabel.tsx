// Painting and location status, shown as a small label, not a chip.
// Colours and emphasis from docs/DESIGN.md.
export type Status = 'extant' | 'demolished' | 'altered' | 'unknown'

// A small colour marker plus the word. The hue (sage, ochre, bensham) carries
// the at-a-glance coding the book uses for its map; the word itself stays in an
// accessible ink colour so it always meets contrast. The dot is decorative.
const map: Record<Status, { label: string; dot: string; text: string }> = {
  extant: { label: 'Extant', dot: 'bg-sage', text: 'text-ink-soft' },
  demolished: { label: 'Demolished', dot: 'bg-bensham', text: 'text-bensham' },
  altered: { label: 'Altered', dot: 'bg-ochre', text: 'text-ink-soft' },
  unknown: { label: 'Status unknown', dot: 'bg-ink-mute', text: 'text-ink-mute' },
}

export function StatusLabel({ status }: { status: Status }) {
  const s = map[status]
  return (
    <span className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow">
      <span className={`inline-block h-2 w-2 ${s.dot}`} aria-hidden="true" />
      <span className={s.text}>{s.label}</span>
    </span>
  )
}
