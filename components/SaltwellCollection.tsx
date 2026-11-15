'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { corners, saltwellAlt, saltwellSrc, type Corner, type SaltwellPainting } from '@/lib/content/saltwell'

// Charlie's Saltwell Park: every picture in the collection Brian sent, sorted
// into the corners of the park he kept going back to, above a year strip that
// shows how steadily he went back. Choosing a corner thins the wall and lights
// its years on the strip; the viewer walks through whatever is showing.
//
// Same viewer rules as the Gallery lightbox: keyboard (arrows, Escape), focus
// returned to the picture that opened it, deep ink rather than black, square
// corners, no shadow.

const FIRST = 1979
const LAST = 2017

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function YearStrip({ all, showing }: { all: SaltwellPainting[]; showing: Set<string> }) {
  const span = LAST - FIRST
  const byYear = new Map<number, SaltwellPainting[]>()
  for (const p of all) byYear.set(p.year, [...(byYear.get(p.year) ?? []), p])
  const tallest = Math.max(...[...byYear.values()].map((v) => v.length))
  const step = 9
  const height = tallest * step + 4
  return (
    <figure className="mt-10" aria-label="Pictures of Saltwell Park by year, 1979 to 2017">
      <svg viewBox={`-24 0 ${span * 20 + 48} ${height + 30}`} className="block h-auto w-full" role="img" aria-hidden="true">
        <line x1={0} x2={span * 20} y1={height} y2={height} stroke="currentColor" className="text-ink" strokeWidth={1.5} />
        {[...byYear.entries()].map(([year, ps]) =>
          ps.map((p, i) => (
            <rect
              key={p.n}
              x={(year - FIRST) * 20 - 3.5}
              y={height - 4 - (i + 1) * step + 2}
              width={7}
              height={7}
              className={showing.has(p.n) ? 'fill-bensham' : 'fill-rule'}
              style={{ transition: 'fill 200ms ease-out' }}
            />
          )),
        )}
        {[1979, 1990, 2000, 2010, 2017].map((y) => (
          <g key={y}>
            <line x1={(y - FIRST) * 20} x2={(y - FIRST) * 20} y1={height} y2={height + 5} stroke="currentColor" className="text-ink" />
            <text x={(y - FIRST) * 20} y={height + 24} textAnchor="middle" className="fill-ink-mute font-sans" style={{ fontSize: 15 }}>
              {y}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

export function SaltwellCollection({ paintings }: { paintings: SaltwellPainting[] }) {
  const [corner, setCorner] = useState<Corner | 'all'>('all')
  const shown = useMemo(
    () => (corner === 'all' ? paintings : paintings.filter((p) => p.corner === corner)),
    [corner, paintings],
  )
  const showing = useMemo(() => new Set(shown.map((p) => p.n)), [shown])
  const count = shown.length
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

  const current = index !== null ? shown[index] : null
  const label = (c: Corner) => corners.find((k) => k.slug === c)?.label ?? ''
  const tally = (c: Corner) => paintings.filter((p) => p.corner === c).length

  return (
    <>
      <YearStrip all={paintings} showing={showing} />

      <div className="sticky top-[4.5rem] z-10 -mx-6 mt-10 border-y border-rule bg-paper/95 px-6 py-3">
        <div role="group" aria-label="Show a corner of the park" className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...corners.map((c) => c.slug)] as const).map((c) => {
            const on = corner === c
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCorner(c)}
                className={`shrink-0 border px-3 py-2 font-sans text-xs transition-colors duration-colour ${
                  on ? 'border-bensham bg-bensham text-paper' : 'border-rule text-ink-soft hover:border-ink-mute hover:text-ink'
                }`}
              >
                {c === 'all' ? `Everything (${paintings.length})` : `${label(c)} (${tally(c)})`}
              </button>
            )
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {corner === 'all' ? `Showing all ${count} pictures` : `Showing ${count} pictures of ${label(corner).toLowerCase()}`}
      </p>

      <div className="mt-10 grid items-start gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <figure key={p.n} className="min-w-0">
            <button
              type="button"
              ref={(el) => {
                triggers.current[i] = el
              }}
              onClick={() => {
                lastFocused.current = i
                setIndex(i)
              }}
              aria-label={`View ${p.title}, ${p.date}, larger`}
              className="group block w-full cursor-zoom-in border border-rule bg-mount p-3 transition-colors duration-colour hover:border-ink-mute"
            >
              <Image
                src={saltwellSrc(p)}
                width={p.width}
                height={p.height}
                alt={saltwellAlt(p)}
                sizes="(min-width: 1280px) 18rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="block h-auto w-full transition-transform duration-sheet ease-out group-hover:scale-[1.015]"
              />
            </button>
            <figcaption className="mt-2">
              <span className="block font-serif text-body leading-snug">{p.title}</span>
              <span className="mt-0.5 block font-sans text-xs text-ink-mute">
                {[p.date, p.medium].filter(Boolean).join(' · ')}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(26, 25, 22, 0.95)' }}
        >
          <p className="absolute left-4 top-4 max-w-[60vw] font-sans text-xs uppercase tracking-eyebrow text-ochre sm:left-6" aria-hidden="true">
            Saltwell Park · {label(current.corner)}
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
                aria-label="Previous picture"
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
                aria-label="Next picture"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-paper hover:text-ochre sm:right-4"
              >
                <Chevron dir="right" />
              </button>
            </>
          )}
          <figure onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] max-w-[92vw] flex-col items-center">
            <span className="block bg-mount p-2 sm:p-3">
              <Image
                key={current.n}
                src={saltwellSrc(current)}
                width={current.width}
                height={current.height}
                alt={saltwellAlt(current)}
                sizes="92vw"
                quality={90}
                className="block h-auto max-h-[78vh] w-auto max-w-[86vw]"
              />
            </span>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center">
              <span className="font-serif text-h4 text-paper">{current.title}</span>
              <span className="font-sans text-xs text-paper/70">{[current.date, current.medium].filter(Boolean).join(' · ')}</span>
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
