'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Painting } from '@/lib/paintings'

// Salon-wall gallery with an accessible lightbox.
//
// Layout: each painting is shown at its true aspect ratio, sized from its native
// resolution and never upscaled, then bottom-aligned like pictures hung on a wall.
// This suits a mixed-resolution archive far better than a rigid grid, which would
// stretch the small reproductions into blur.
//
// Lightbox: the painting detail viewer DESIGN.md sanctions. Keyboard navigable
// (arrows, Escape), focus-managed, no pure black (a deep ink overlay), square
// corners, no shadow.

// Target display height on desktop. A gentle floor keeps the smallest plates from
// becoming lost without any visible upscaling.
const ROW_HEIGHT = 240
const MIN_HEIGHT = 160

function displaySize(p: Painting): { w: number; h: number } {
  const h = Math.min(ROW_HEIGHT, Math.max(p.height, MIN_HEIGHT))
  const w = Math.round(p.width * (h / p.height))
  return { w, h }
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

export function Gallery({ paintings }: { paintings: Painting[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const closeButton = useRef<HTMLButtonElement | null>(null)
  const lastFocused = useRef<number | null>(null)

  const open = index !== null
  const count = paintings.length

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i + count - 1) % count)),
    [count],
  )
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, prev, next])

  // Restore focus to the painting that opened the viewer.
  useEffect(() => {
    if (open || lastFocused.current === null) return
    triggers.current[lastFocused.current]?.focus()
    lastFocused.current = null
  }, [open])

  if (count === 0) {
    return (
      <p className="font-serif text-ink-mute mt-6">
        Paintings for this section are being catalogued.
      </p>
    )
  }

  const current = index !== null ? paintings[index] : null

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-10">
        {paintings.map((p, i) => {
          const { w } = displaySize(p)
          return (
            <button
              key={p.web}
              type="button"
              ref={(el) => {
                triggers.current[i] = el
              }}
              onClick={() => {
                lastFocused.current = i
                setIndex(i)
              }}
              style={{ width: w }}
              className="group max-w-full cursor-pointer border-0 bg-transparent p-0 text-left"
              aria-label={`Enlarge painting from page ${p.page}`}
            >
              <span className="block bg-paper-warm p-2 transition-colors group-hover:bg-rule">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumb}
                  alt={`Painting by Charlie Rogers, from page ${p.page} of Pursued by Bulldozers`}
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </span>
              <span className="mt-2 block font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                Page {p.page}
              </span>
            </button>
          )
        })}
      </div>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Painting from page ${current.page}`}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(26, 25, 22, 0.93)' }}
        >
          <button
            ref={closeButton}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
            aria-label="Close"
            className="absolute right-3 top-3 px-3 py-2 font-sans text-xs uppercase tracking-eyebrow text-paper hover:text-ochre"
          >
            Close
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="Previous painting"
                className="absolute left-1 top-1/2 -translate-y-1/2 p-3 text-paper hover:text-ochre sm:left-4"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Next painting"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-paper hover:text-ochre sm:right-4"
              >
                <Chevron dir="right" />
              </button>
            </>
          )}

          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] max-w-[92vw] flex-col items-center"
          >
            <span className="block bg-paper-warm p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.web}
                alt={`Painting by Charlie Rogers, from page ${current.page} of Pursued by Bulldozers`}
                className="block h-auto max-h-[78vh] w-auto max-w-[88vw]"
              />
            </span>
            <figcaption className="mt-3 font-sans text-xs uppercase tracking-eyebrow text-paper opacity-80">
              Pursued by Bulldozers, page {current.page} &middot; {index + 1} of{' '}
              {count}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
