'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sanitiseBasket, MAX_LINE_QUANTITY, type BasketLine } from '@/lib/shop/commerce'

// The basket lives in the visitor's browser: slugs and quantities only, never
// prices (see lib/shop/commerce.ts). No account, no cookie for the server to
// read, nothing stored about anyone until they place an order.
//
// Kept in step across tabs through the storage event, so adding the book in
// one tab updates the count in another.

const STORAGE_KEY = 'charlie-rogers-basket-v1'

interface BasketContextValue {
  lines: BasketLine[]
  count: number
  // False until the stored basket has been read. Lets the basket page avoid
  // flashing "empty" before it knows.
  ready: boolean
  add: (slug: string, quantity?: number) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  replace: (lines: BasketLine[]) => void
  clear: () => void
}

const BasketContext = createContext<BasketContextValue | null>(null)

function read(): BasketLine[] {
  try {
    return sanitiseBasket(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    // Private windows and blocked storage throw. An empty basket is the
    // honest fallback; adding still works for the life of the page.
    return []
  }
}

function write(lines: BasketLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // As above: the basket still works in memory.
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLines(read())
    setReady(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((next: (prev: BasketLine[]) => BasketLine[]) => {
    setLines((prev) => {
      const out = sanitiseBasket(next(prev))
      write(out)
      return out
    })
  }, [])

  const value = useMemo<BasketContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      add: (slug, quantity = 1) =>
        update((prev) => {
          const existing = prev.find((l) => l.slug === slug)
          if (!existing) return [...prev, { slug, quantity }]
          return prev.map((l) =>
            l.slug === slug
              ? { slug, quantity: Math.min(l.quantity + quantity, MAX_LINE_QUANTITY) }
              : l,
          )
        }),
      setQuantity: (slug, quantity) =>
        update((prev) =>
          quantity < 1
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { slug, quantity } : l)),
        ),
      remove: (slug) => update((prev) => prev.filter((l) => l.slug !== slug)),
      replace: (next) => update(() => next),
      clear: () => update(() => []),
    }),
    [lines, ready, update],
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

// For chrome that is also drawn outside the public layout, such as the header
// on the root not-found page. Null there rather than an error.
export function useOptionalBasket(): BasketContextValue | null {
  return useContext(BasketContext)
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider')
  return ctx
}
