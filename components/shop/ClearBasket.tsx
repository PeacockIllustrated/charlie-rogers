'use client'

import { useEffect } from 'react'
import { useBasket } from './BasketProvider'

// Empties the basket once the confirmation page has loaded. Done here rather
// than in the form, so a failed or abandoned submission never loses it.
export function ClearBasket() {
  const { clear, ready } = useBasket()
  useEffect(() => {
    if (ready) clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  return null
}
