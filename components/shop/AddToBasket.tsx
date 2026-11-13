'use client'

import Link from 'next/link'
import { useState } from 'react'
import { lineKey } from '@/lib/shop/commerce'
import { formatPence } from '@/lib/shop/utils'
import { useBasket } from './BasketProvider'

export interface BasketChoice {
  code: string
  name: string
  detail: string | null
  pricePence: number
  // The most one order may take. Zero when this edition has sold out.
  maxQuantity: number
}

// Quantity and "Add to basket" on a product page, with a choice of edition for
// a print. The quantity is a select, not a free number field: the range is
// small, and a select cannot be typed into a state the basket would then have
// to correct.
export function AddToBasket({
  slug,
  title,
  maxQuantity,
  choices = [],
}: {
  slug: string
  title: string
  // For a product with no choices.
  maxQuantity: number
  choices?: BasketChoice[]
}) {
  const { add, lines } = useBasket()
  const firstAvailable = choices.find((c) => c.maxQuantity > 0) ?? choices[0]
  const [option, setOption] = useState<string | undefined>(firstAvailable?.code)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState<string | null>(null)

  const choice = choices.find((c) => c.code === option)
  const max = choice ? choice.maxQuantity : maxQuantity
  const key = lineKey({ slug, option })
  const inBasket = lines.find((l) => lineKey(l) === key)?.quantity ?? 0
  const room = Math.max(0, max - inBasket)
  const label = choice ? `${title}, ${choice.name.toLowerCase()}` : title

  return (
    <div>
      {choices.length > 0 && (
        <fieldset className="mb-5">
          <legend className="input-label">Edition</legend>
          <div className="mt-2 space-y-2">
            {choices.map((c) => {
              const soldOut = c.maxQuantity === 0
              return (
                <label
                  key={c.code}
                  className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors duration-colour ${
                    option === c.code ? 'border-bensham bg-paper' : 'border-rule hover:border-ink-mute'
                  } ${soldOut ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <input
                    type="radio"
                    name={`edition-${slug}`}
                    value={c.code}
                    checked={option === c.code}
                    disabled={soldOut}
                    onChange={() => {
                      setOption(c.code)
                      setQuantity(1)
                      setAdded(null)
                    }}
                    className="mt-1.5 accent-bensham"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-serif text-body text-ink">{c.name}</span>
                      <span className="font-serif text-body text-bensham">
                        {soldOut ? 'Sold out' : formatPence(c.pricePence)}
                      </span>
                    </span>
                    {c.detail && <span className="block font-sans text-small text-ink-mute">{c.detail}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="input-label">Quantity</span>
          <select
            value={Math.min(quantity, Math.max(room, 1))}
            onChange={(e) => {
              setQuantity(Number(e.target.value))
              setAdded(null)
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
            add(slug, Math.min(quantity, room), option)
            setQuantity(1)
            setAdded(label)
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
            Added {added} to your basket.{' '}
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
