import type { CSSProperties } from 'react'

// The progress track for one era's spine.
//
// The entries already draw a hairline rule down their left edge (border-l on
// each entry's content column). This span is absolutely positioned directly
// over that rule and scaled from the top, so the portion the reader has passed
// reads as a thicker, darker line and the portion ahead stays a hairline. It is
// absolutely positioned precisely so that thickening it cannot shift the
// entries sideways; the real border is never touched.
//
// It is filled by a CSS scroll-driven animation (see .tl-track in globals.css),
// which needs no JavaScript at all. Where the browser has no support for
// scroll-driven animations, TrackFallback drives the same transform from a
// throttled scroll listener. With neither, the span stays at scaleY(0) and the
// timeline looks exactly as it did before, a plain hairline.
//
// Left offset: the entry grid is [3.5rem, gap 1rem] and [4.5rem, gap 1.5rem]
// from sm up, so the rule sits at 4.5rem and 6rem. The extra pixel centres the
// 3px track on the 1px rule.
export function ProgressTrack({ steps }: { steps: number }) {
  // --tl-steps quantises the fill under prefers-reduced-motion, one jump per
  // entry rather than a continuous slide. React's CSSProperties has no index
  // signature for custom properties, so the assertion is the standard way to
  // set one; it is a narrowing of a known object, not an `any`.
  const style = { '--tl-steps': steps } as CSSProperties

  return (
    <span
      data-tl-track=""
      style={style}
      aria-hidden="true"
      className="tl-track pointer-events-none absolute bottom-0 top-0 left-[calc(4.5rem-1px)] w-[3px] bg-ink-soft sm:left-[calc(6rem-1px)]"
    />
  )
}
