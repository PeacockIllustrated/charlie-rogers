import Image from 'next/image'
import Link from 'next/link'
import type { Entry } from '@/lib/content/catalogue'

// A catalogue entry in a grid. The image sits on its mount at its own aspect
// ratio, capped at native width, and the whole card links to the entry page.
export function CatalogueCard({
  entry,
  sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw',
}: {
  entry: Entry
  sizes?: string
}) {
  const { image } = entry
  return (
    <Link href={`/catalogue/${entry.slug}`} className="group block">
      <div className="flex aspect-[5/4] items-center justify-center bg-mount p-[8%] transition-colors duration-colour group-hover:bg-paper-warm">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={entry.alt}
          sizes={sizes}
          className="block h-auto max-h-full w-auto max-w-full object-contain"
        />
      </div>
      <h3 className="mt-4 font-serif text-h4 transition-colors duration-colour group-hover:text-bensham">
        {entry.title}
      </h3>
      <p className="mt-1 font-sans text-xs text-ink-mute">
        {[entry.year ?? 'Undated', entry.medium].filter(Boolean).join(' · ')}
      </p>
    </Link>
  )
}
