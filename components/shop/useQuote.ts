'use client'

import { useEffect, useState } from 'react'
import { quoteBasketAction } from '@/app/(public)/shop/actions'
import { basketFromQuote, type Quote } from '@/lib/shop/commerce'
import { useBasket } from './BasketProvider'

// Ask the server to price the basket whenever it changes. If anything in it
// can no longer be bought, or not in that number, the stored basket is
// corrected and the reason kept as a notice for the customer to read.
export function useQuote(): { quote: Quote | null; notices: string[]; loading: boolean; failed: boolean } {
  const { lines, ready, replace } = useBasket()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [notices, setNotices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const key = JSON.stringify(lines)

  useEffect(() => {
    if (!ready) return
    let live = true
    setLoading(true)
    quoteBasketAction(lines)
      .then((q) => {
        if (!live) return
        setQuote(q)
        setFailed(false)
        if (q.problems.length > 0) {
          setNotices((prev) => [...prev, ...q.problems.map((p) => p.message)])
          replace(basketFromQuote(q))
        }
      })
      .catch((err: unknown) => {
        console.error('[shop] could not price basket', err)
        if (live) setFailed(true)
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
    // `key` stands in for `lines`, which is a new array on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready])

  return { quote, notices, loading: loading || !ready, failed }
}
