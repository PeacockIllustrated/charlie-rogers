import { formatPence } from '@/lib/shop/utils'

// The totals block, shared by the basket, the checkout and the order
// confirmation so all three read the same way. A null postage is shown as to
// be confirmed, and the total is then labelled as excluding it, so no figure
// is ever presented as final when it is not.
export function OrderTotals({
  subtotalPence,
  postagePence,
  totalPence,
}: {
  subtotalPence: number
  postagePence: number | null
  totalPence: number
}) {
  return (
    <dl className="space-y-2 font-sans text-small">
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="text-ink">{formatPence(subtotalPence)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">UK postage</dt>
        <dd className="text-ink">
          {postagePence === null ? 'To be confirmed' : postagePence === 0 ? 'Free' : formatPence(postagePence)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-rule pt-3">
        <dt className="uppercase tracking-eyebrow text-xs text-ink">
          {postagePence === null ? 'Total before postage' : 'Total'}
        </dt>
        <dd className="font-serif text-h3 text-bensham">{formatPence(totalPence)}</dd>
      </div>
    </dl>
  )
}
