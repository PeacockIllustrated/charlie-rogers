'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// Draws a graphic's pen lines in when it scrolls into view, the way a sketch
// builds up on the page. Lines carry pathLength="1" and the class "ink"; the
// CSS in globals.css does the drawing. With reduced motion the lines are
// simply there.
export function DrawIn({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`draw ${drawn ? 'is-drawn' : ''} ${className}`}>
      {children}
    </div>
  )
}
