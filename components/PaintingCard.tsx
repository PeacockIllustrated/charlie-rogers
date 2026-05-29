import { StatusLabel, type Status } from './StatusLabel'

// The primary content surface. No frame, no shadow; whitespace does the
// separating. Image shown at native aspect ratio, never cropped. See docs/DESIGN.md.
// Next.js Image and proper sizes are deferred to the Phase 6 performance pass.
export function PaintingCard({
  src,
  title,
  location,
  year,
  medium,
  status,
}: {
  src: string
  title: string
  location?: string
  year?: number | string
  medium?: string
  status?: Status
}) {
  const metaTop = [location, year].filter(Boolean).join(' · ')
  return (
    <figure>
      <div className="bg-paper-warm p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} loading="lazy" className="block w-full h-auto" />
      </div>
      <figcaption className="mt-3">
        <div className="font-serif text-body-lg font-medium">{title}</div>
        {metaTop && (
          <div className="font-sans text-small uppercase tracking-eyebrow text-ink-soft mt-1">
            {metaTop}
          </div>
        )}
        {medium && (
          <div className="font-serif italic text-ink-mute mt-1">{medium}</div>
        )}
        {status && (
          <div className="mt-1">
            <StatusLabel status={status} />
          </div>
        )}
      </figcaption>
    </figure>
  )
}
