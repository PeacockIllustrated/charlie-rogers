'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
import { Roundel } from '@/components/Roundel'
import { formatPence, shopImageUrl } from '@/lib/shop/utils'
import { PRODUCT_TYPE_LABELS } from '@/lib/shop/types'
import { useBasket } from './BasketProvider'
import { useQuote } from './useQuote'
import { OrderTotals } from './OrderSummary'

export function Notices({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null
  return (
    <div role="status" className="border border-ochre bg-paper p-4 font-sans text-small text-ink">
      {notices.map((n, i) => (
        <p key={i}>{n}</p>
      ))}
    </div>
  )
}

export function BasketView({ checkoutOpen }: { checkoutOpen: boolean }) {
  const { setQuantity, remove } = useBasket()
  const { quote, notices, loading, failed } = useQuote()

  if (failed && !quote) {
    return (
      <p className="max-w-reading font-serif text-body text-ink-soft">
        Your basket could not be priced just now. Please refresh the page to try again.
      </p>
    )
  }

  if (loading && !quote) {
    return <p className="font-sans text-small text-ink-mute">Loading your basket.</p>
  }

  if (!quote || quote.lines.length === 0) {
    return (
      <div className="space-y-6">
        <Notices notices={notices} />
        <div className="max-w-reading border border-rule bg-paper p-6 sm:p-8">
          <h2 className="font-serif text-h3">Your basket is empty</h2>
          <p className="mt-3 font-serif text-body text-ink-soft">
            The special edition of the book and the greeting cards can be ordered
            here. The paintings are by enquiry.
          </p>
          <div className="mt-8">
            <Button href="/shop">Back to the shop</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Notices notices={notices} />
        <ul className="border-t border-rule">
          {quote.lines.map((line) => {
            const img = shopImageUrl(line.imagePath)
            return (
              <li key={line.slug} className="grid grid-cols-[5rem_1fr] gap-4 border-b border-rule py-5 sm:grid-cols-[6rem_1fr_auto]">
                <div className="flex aspect-square items-center justify-center bg-mount p-2">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={line.imageAlt ?? ''} className="max-h-full max-w-full object-contain" />
                  ) : (
                    // No photograph yet: the roundel stands in, as on the shop cards.
                    <Roundel size={56} tone={line.productType === 'book' ? 'bensham' : 'ink'} />
                  )}
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                    {PRODUCT_TYPE_LABELS[line.productType]}
                  </p>
                  <Link href={`/shop/${line.slug}`} className="mt-1 block font-serif text-h4 hover:text-bensham">
                    {line.title}
                  </Link>
                  <p className="mt-1 font-sans text-small text-ink-soft">{formatPence(line.unitPence)} each</p>
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 font-sans text-small text-ink-soft">
                      <span>Quantity</span>
                      <select
                        value={line.quantity}
                        onChange={(e) => setQuantity(line.slug, Number(e.target.value))}
                        className="input w-20 py-1"
                        aria-label={`Quantity of ${line.title}`}
                      >
                        {Array.from({ length: line.maxQuantity }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(line.slug)}
                      className="font-sans text-small text-ink-soft underline underline-offset-4 hover:text-bensham"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="col-start-2 font-serif text-body text-ink sm:col-start-auto sm:text-right">
                  {formatPence(line.lineTotalPence)}
                </p>
              </li>
            )
          })}
        </ul>
        <Link href="/shop" className="inline-block font-sans text-small text-ink-soft underline-offset-4 hover:underline">
          Continue browsing
        </Link>
      </div>

      <aside className="self-start border border-rule border-t-2 border-t-bensham bg-paper-warm p-6 lg:col-span-4">
        <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Your order</p>
        <div className="mt-5" aria-busy={loading}>
          <OrderTotals
            subtotalPence={quote.subtotalPence}
            postagePence={quote.postagePence}
            totalPence={quote.totalPence}
          />
        </div>
        <div className="mt-6">
          {checkoutOpen ? (
            <Button href="/shop/checkout" className="w-full text-center">
              Continue to checkout
            </Button>
          ) : (
            <p className="font-sans text-small text-ink-soft">
              Online ordering is not open yet. Your basket is kept in this
              browser in the meantime.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}
