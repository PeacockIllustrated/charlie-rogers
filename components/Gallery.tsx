import type { Painting } from '@/lib/paintings'

// Painting grid. Captions by source page only, since per-painting titles are
// not yet verified. Images at native aspect ratio, no cropping, no frame.
export function Gallery({ paintings }: { paintings: Painting[] }) {
  if (paintings.length === 0) {
    return (
      <p className="font-serif text-ink-mute mt-6">
        Paintings for this section are being catalogued.
      </p>
    )
  }
  return (
    <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {paintings.map((p) => (
        <figure key={p.web}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.web}
            alt={`Painting by Charlie Rogers, from page ${p.page} of Pursued by Bulldozers`}
            loading="lazy"
            className="block w-full h-auto"
          />
          <figcaption className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
            Pursued by Bulldozers &middot; p.{p.page}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
