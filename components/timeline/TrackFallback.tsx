'use client'

// Client Component because it has to read scroll position, which only exists in
// the browser. It renders nothing and only runs at all in browsers without CSS
// scroll-driven animations; where `animation-timeline: view()` is supported the
// track is filled by CSS alone and this does nothing.
//
// The listener is passive and throttled with requestAnimationFrame, so at most
// one measurement happens per frame however fast the reader scrolls.

import { useEffect } from 'react'

// The reading line, as a fraction of viewport height. Progress for a track is
// how far that line has travelled down it. It matches the 60% inset used by the
// CSS view() timeline in globals.css, so both paths agree.
const READING_LINE = 0.6

export function TrackFallback() {
  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()')) {
      return
    }

    const tracks = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tl-track]'),
    )
    if (tracks.length === 0) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * READING_LINE
      for (const track of tracks) {
        const box = track.getBoundingClientRect()
        if (box.height === 0) continue
        let progress = (line - box.top) / box.height
        progress = Math.min(1, Math.max(0, progress))
        if (reduced.matches) {
          // One jump per entry, matching steps(--tl-steps, end) in the CSS.
          const steps = Number(track.style.getPropertyValue('--tl-steps')) || 1
          progress = Math.floor(progress * steps) / steps
        }
        track.style.transform = `scaleY(${progress})`
      }
    }

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    reduced.addEventListener('change', update)

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduced.removeEventListener('change', update)
    }
  }, [])

  return null
}
