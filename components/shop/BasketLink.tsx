'use client'

import Link from 'next/link'
import { useOptionalBasket } from './BasketProvider'

// The basket in the header. Only drawn once something is in it: the shop is
// not in the main navigation, and an empty basket on every archive page would
// put commerce ahead of the heritage, which the brief says it is not.
export function BasketLink({ className = '' }: { className?: string }) {
  const basket = useOptionalBasket()
  if (!basket?.ready || basket.count === 0) return null
  const { count } = basket
  return (
    <Link
      href="/shop/basket"
      className={`inline-flex items-center gap-2 border border-rule px-3 py-1.5 font-sans text-xs uppercase tracking-eyebrow text-ink-soft transition-colors duration-colour hover:border-ink-mute hover:text-ink ${className}`}
      aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      Basket
      <span className="bg-bensham px-1.5 py-0.5 text-paper tabular-nums">{count}</span>
    </Link>
  )
}
