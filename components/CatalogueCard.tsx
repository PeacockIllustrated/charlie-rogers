import Image from 'next/image'
import Link from 'next/link'
import type { Entry } from '@/lib/content/catalogue'

// A catalogue entry in a grid, as one bordered box: the image on its mount at
// its own aspect ratio, capped at native width, and the caption beneath.
export function CatalogueCard({
  entry,
  sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw',
}: {
  entry: Entry
  sizes?: string
}) {
  const { image } = entry
  return (
    <Link
      href={`/catalogue/${entry.slug}`}
      className="group flex h-full flex-col border border-rule bg-paper transition-colors duration-colour hover:border-ink-mute"
    >
      {/* The picture is placed in an absolutely sized box inside the mount, so
          a tall picture is held to the mount's height. In a plain flex box
          its max-height had nothing definite to resolve against, so a portrait
          painting stretched its card and left the rest of the row with a gap
          between title and date. */}
      <div className="relative aspect-[5/4] bg-mount">
        <div className="absolute inset-[8%] flex items-center justify-center">
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt={entry.alt}
            sizes={sizes}
            className="block h-auto max-h-full w-auto max-w-full"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col border-t border-rule px-4 pb-4 pt-3">
        <h3 className="font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
          {entry.title}
        </h3>
        <p className="mt-auto pt-1 font-sans text-xs text-ink-mute">
          {[entry.year ?? 'Undated', entry.medium].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
