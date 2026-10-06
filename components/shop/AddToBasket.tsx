'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBasket } from './BasketProvider'

// Quantity and "Add to basket" on a product page. The quantity is a select,
// not a free number field: the range is small, and a select cannot be typed
// into a state the basket would then have to correct.
export function AddToBasket({
  slug,
  title,
  maxQuantity,
}: {
  slug: string
  title: string
  maxQuantity: number
}) {
  const { add, lines } = useBasket()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const inBasket = lines.find((l) => l.slug === slug)?.quantity ?? 0
  const room = Math.max(0, maxQuantity - inBasket)

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="input-label">Quantity</span>
          <select
            value={Math.min(quantity, Math.max(room, 1))}
            onChange={(e) => {
              setQuantity(Number(e.target.value))
              setAdded(false)
            }}
            disabled={room === 0}
            className="input w-24"
          >
            {Array.from({ length: Math.max(room, 1) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={room === 0}
          onClick={() => {
            add(slug, Math.min(quantity, room))
            setQuantity(1)
            setAdded(true)
          }}
          className="inline-block bg-bensham px-5 py-2.5 font-sans text-small font-medium text-paper transition-colors duration-colour hover:bg-bensham-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to basket
        </button>
      </div>

      {/* Announced politely, so a screen reader hears that the add worked
          without focus being moved. */}
      <p className="mt-3 min-h-[1.45em] font-sans text-small text-ink-soft" aria-live="polite">
        {added ? (
          <>
            Added {title} to your basket.{' '}
            <Link href="/shop/basket" className="text-bensham underline underline-offset-4">
              View basket
            </Link>
          </>
        ) : room === 0 && inBasket > 0 ? (
          <>
            The most one order can take is already in your basket.{' '}
            <Link href="/shop/basket" className="text-bensham underline underline-offset-4">
              View basket
            </Link>
          </>
        ) : null}
      </p>
    </div>
  )
}
