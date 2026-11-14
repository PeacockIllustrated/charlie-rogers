'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DecadePicks } from '@/lib/content/decades'

// The top of The Work: a room for each decade, hung with the paintings Brian
// Rankin chose for it, each of which opens larger. The viewer walks through
// every room in order, so it reads as one tour of the work.
//
// Same viewer rules as the Gallery lightbox: keyboard (arrows, Escape), focus
// returned to the painting that opened it, deep ink rather than black, square
// corners, no shadow.

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function Enlarge() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function DecadeRooms({ decades }: { decades: DecadePicks[] }) {
  const flat = decades.flatMap((d) => d.picks.map((p) => ({ ...p, decade: d.decade })))
  const count = flat.length
  const [index, setIndex] = useState<number | null>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const closeButton = useRef<HTMLButtonElement | null>(null)
  const lastFocused = useRef<number | null>(null)
  const open = index !== null

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i + count - 1) % count)), [count])
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count])

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

  useEffect(() => {
    if (open || lastFocused.current === null) return
    triggers.current[lastFocused.current]?.focus()
    lastFocused.current = null
  }, [open])

  const current = index !== null ? flat[index] : null
  let n = -1

  return (
    <>
      <div className="divide-y divide-rule border-y-2 border-ink">
        {decades.map((d) => (
          <section key={d.decade} id={`room-${d.decade}`} aria-labelledby={`room-${d.decade}-h`} className="grid gap-8 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <h3
                  id={`room-${d.decade}-h`}
                  className="font-serif text-[clamp(4rem,9vw,7.5rem)] leading-[0.85] tracking-tight text-bensham"
                  style={{ fontVariantNumeric: 'lining-nums' }}
                >
                  {d.decade}
                  <span className="text-ink-mute">s</span>
                </h3>
                <p className="mt-4 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                  {d.picks.length === 1 ? 'One painting' : `${d.picks.length} paintings`}
                </p>
              </div>
            </div>

            <div className={`grid gap-x-8 gap-y-10 lg:col-span-9 ${d.picks.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {d.picks.map((p, i) => {
                n += 1
                const at = n
                // The first painting of a busy decade hangs across the room.
                const wide = d.picks.length > 1 && i === 0 && d.picks.length % 2 === 1
                return (
                  <figure key={p.entry.slug} className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
                    <button
                      type="button"
                      ref={(el) => {
                        triggers.current[at] = el
                      }}
                      onClick={() => {
                        lastFocused.current = at
                        setIndex(at)
                      }}
                      aria-label={`View ${p.entry.title}${p.entry.year ? `, ${p.entry.year}` : ''} larger`}
                      className="group relative block w-full cursor-zoom-in border border-rule bg-mount p-4 text-left transition-colors duration-colour hover:border-ink-mute sm:p-6"
                    >
                      <span className={`flex items-center justify-center ${wide || d.picks.length === 1 ? 'min-h-[18rem] lg:min-h-[28rem]' : 'aspect-[5/4]'}`}>
                        <Image
                          src={p.entry.image.src}
                          width={p.entry.image.width}
                          height={p.entry.image.height}
                          alt={p.entry.alt}
                          sizes={wide || d.picks.length === 1 ? '(min-width: 1024px) 52rem, 100vw' : '(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 100vw'}
                          className={`block h-auto w-auto max-w-full transition-transform duration-sheet ease-out group-hover:scale-[1.015] ${
                            wide || d.picks.length === 1 ? 'max-h-[34rem]' : 'max-h-full'
                          }`}
                        />
                      </span>
                      <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-paper/90 px-2 py-1 font-sans text-[0.6875rem] uppercase tracking-eyebrow text-ink-soft opacity-0 transition-opacity duration-fade group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Enlarge />
                        View larger
                      </span>
                    </button>
                    <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <Link href={`/catalogue/${p.entry.slug}`} className="font-serif text-h4 hover:text-bensham">
                        {p.entry.title}
                      </Link>
                      <span className="font-sans text-xs text-ink-mute">
                        {[p.entry.year ?? 'Undated', p.entry.medium].filter(Boolean).join(' · ')}
                      </span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.entry.title}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(26, 25, 22, 0.95)' }}
        >
          <p className="absolute left-4 top-4 font-serif text-h3 text-ochre sm:left-6" aria-hidden="true">
            {current.decade}s
          </p>
          <button
            ref={closeButton}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
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

          <figure onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] max-w-[92vw] flex-col items-center">
            <span className="block bg-mount p-2 sm:p-3">
              <Image
                key={current.large.src}
                src={current.large.src}
                width={current.large.width}
                height={current.large.height}
                alt={current.entry.alt}
                sizes="92vw"
                quality={90}
                className="block h-auto max-h-[78vh] w-auto max-w-[86vw]"
              />
            </span>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center">
              <span className="font-serif text-h4 text-paper">{current.entry.title}</span>
              <span className="font-sans text-xs text-paper/70">
                {[current.entry.year, current.entry.medium].filter(Boolean).join(' · ')}
              </span>
              <Link
                href={`/catalogue/${current.entry.slug}`}
                className="font-sans text-xs uppercase tracking-eyebrow text-ochre hover:text-paper"
              >
                Catalogue entry
              </Link>
              <span className="font-sans text-xs text-paper/50">
                {index + 1} of {count}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
