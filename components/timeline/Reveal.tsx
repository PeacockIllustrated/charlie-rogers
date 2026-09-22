'use client'

// Client Component because the reveal depends on IntersectionObserver and on
// matchMedia, neither of which exists on the server. It is a thin wrapper only:
// its children are rendered on the server and passed through untouched, so the
// timeline page itself stays a Server Component.
//
// The motion is one fade-up per entry as it scrolls into view, 200ms ease-out,
// matching the cross-fade timing in docs/DESIGN.md. See the Motion section there
// for the recorded decision.
//
// Safety, in order of importance:
//   1. The server-rendered markup carries no hiding class, so with JavaScript
//      off every entry is visible and readable.
//   2. If the reader prefers reduced motion, the effect returns before anything
//      is hidden, and globals.css also forces the classes back to visible.
//   3. Entries already on screen at mount are never hidden, so nothing that the
//      reader can already see flickers or waits for an observer.

import { useEffect, useRef, useState } from 'react'
import type { ReactNode, ElementType } from 'react'

type RevealTag = 'div' | 'li' | 'header'

type RevealState = 'static' | 'pending' | 'in'

export function Reveal({
  children,
  as = 'div',
  className = '',
}: {
  children: ReactNode
  as?: RevealTag
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  // 'static' means JavaScript has not taken over: the element is in its final,
  // visible state. It is the state the server renders and the state it stays in
  // when motion is unavailable or unwanted.
  const [state, setState] = useState<RevealState>('static')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already in or above the viewport when the page loads. Leave it alone.
    if (el.getBoundingClientRect().top < window.innerHeight) return

    setState('pending')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('in')
            observer.disconnect()
          }
        }
      },
      // A small bottom inset so an entry starts once it is properly on screen
      // rather than at the instant its first pixel appears.
      { rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ElementType keeps the tag polymorphic without reaching for `any`.
  const Tag = as as ElementType
  const motionClass =
    state === 'pending' ? 'tl-reveal-pending' : state === 'in' ? 'tl-reveal-in' : ''

  return (
    <Tag ref={ref} className={`${className} ${motionClass}`.trim()}>
      {children}
    </Tag>
  )
}
