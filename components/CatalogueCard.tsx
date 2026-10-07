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
      <div className="flex aspect-[5/4] items-center justify-center bg-mount p-[8%]">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={entry.alt}
          sizes={sizes}
          className="block h-auto max-h-full w-auto max-w-full object-contain"
        />
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
