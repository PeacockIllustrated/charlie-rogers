'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SamplePage } from '@/lib/content/bookSample'

// A clickable book-sample reader. Pages are shown as spreads (two pages on
// desktop, stacked on mobile). Turn with the controls, the arrow keys, or by
// clicking the left or right half of the book. Cross-fade on turn, 200ms, the
// one motion DESIGN.md allows here. Square corners, no shadow; a hairline rule
// stands in for the gutter.

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

function Page({ page }: { page: SamplePage }) {
  if (page.kind === 'title') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
          {page.eyebrow}
        </span>
        <h3 className="mt-6 font-serif text-h2">{page.title}</h3>
        <p className="mt-2 font-serif italic text-h4 text-ink-soft">
          {page.subtitle}
        </p>
        <span className="mt-8 block h-px w-12 bg-rule" aria-hidden="true" />
        <p className="mt-8 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
          {page.meta}
        </p>
      </div>
    )
  }

  if (page.kind === 'plate') {
    return (
      <figure className="flex h-full flex-col items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.image}
          alt={page.alt}
          loading="lazy"
          className="block max-h-[78%] w-auto max-w-full"
        />
        <figcaption className="mt-4 font-serif italic text-ink-mute">
          {page.caption}
        </figcaption>
      </figure>
    )
  }

  if (page.kind === 'cta') {
    return (
      <div className="flex h-full flex-col justify-center">
        <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
          {page.eyebrow}
        </span>
        <h3 className="mt-3 font-serif text-h3 text-bensham">{page.heading}</h3>
        {page.paragraphs.map((p, i) => (
          <p key={i} className="mt-4 font-serif text-body text-ink-soft">
            {p}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <span className="font-sans text-xs uppercase tracking-eyebrow text-bensham">
        {page.eyebrow}
      </span>
      <h3 className="mt-3 font-serif text-h3">{page.heading}</h3>
      <div className="mt-4 space-y-4">
        {page.paragraphs.map((p, i) => (
          <p key={i} className="font-serif text-body text-ink-soft">
            {p}
          </p>
        ))}
      </div>
      {page.quote && (
        <figure className="mt-auto border-l-2 border-bensham pl-4 pt-5">
          <blockquote className="font-serif italic text-body-lg text-ink">
            {page.quote.text}
          </blockquote>
          <figcaption className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
            {page.quote.source}
          </figcaption>
        </figure>
      )}
    </div>
  )
}

export function BookFlip({ pages }: { pages: SamplePage[] }) {
  // Group into spreads of two.
  const spreads: SamplePage[][] = []
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push(pages.slice(i, i + 2))
  }

  const [spread, setSpread] = useState(0)
  const total = spreads.length
  const rootRef = useRef<HTMLDivElement | null>(null)

  const prev = useCallback(() => setSpread((s) => Math.max(0, s - 1)), [])
  const next = useCallback(
    () => setSpread((s) => Math.min(total - 1, s + 1)),
    [total],
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [prev, next])

  const atStart = spread === 0
  const atEnd = spread === total - 1
  const [left, right] = spreads[spread]

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="group"
      aria-roledescription="Book sample reader"
      aria-label={`Book sample, spread ${spread + 1} of ${total}`}
      className="outline-none"
    >
      <div className="relative bg-paper-warm p-2 sm:p-3">
        {/* Clickable turn zones, behind the content. */}
        <button
          type="button"
          onClick={prev}
          disabled={atStart}
          aria-label="Previous pages"
          className="absolute inset-y-0 left-0 z-0 w-1/4 cursor-w-resize disabled:cursor-default"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={next}
          disabled={atEnd}
          aria-label="Next pages"
          className="absolute inset-y-0 right-0 z-0 w-1/4 cursor-e-resize disabled:cursor-default"
          tabIndex={-1}
        />

        <div
          key={spread}
          className="book-page-in pointer-events-none relative z-[1] grid gap-px bg-rule md:grid-cols-2"
        >
          <div className="min-h-[26rem] bg-paper p-8 sm:min-h-[30rem] sm:p-10">
            {left && <Page page={left} />}
          </div>
          <div className="min-h-[26rem] bg-paper p-8 sm:min-h-[30rem] sm:p-10">
            {right && <Page page={right} />}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={atStart}
          className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-eyebrow text-ink-soft hover:text-bensham disabled:text-rule"
        >
          <Chevron dir="left" />
          Previous
        </button>

        <div className="flex items-center gap-2" aria-hidden="true">
          {spreads.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSpread(i)}
              aria-label={`Go to spread ${i + 1}`}
              className={`h-2 w-2 ${i === spread ? 'bg-bensham' : 'bg-rule'}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-eyebrow text-ink-soft hover:text-bensham disabled:text-rule"
        >
          Next
          <Chevron dir="right" />
        </button>
      </div>

      <p className="mt-2 text-center font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
        Spread {spread + 1} of {total}
      </p>
    </div>
  )
}
