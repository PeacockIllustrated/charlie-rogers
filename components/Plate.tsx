import Image from 'next/image'
import type { ReactNode } from 'react'

// A painting on its mount. The mount is bottom-weighted, as a framer cuts it,
// so the picture sits slightly above optical centre. The image is never drawn
// wider than its native pixels: a 245px book plate stays a small plate on a
// generous mount rather than being stretched into blur.
export function Plate({
  src,
  width,
  height,
  alt,
  caption,
  priority = false,
  sizes = '(min-width: 1024px) 60vw, 100vw',
  mount = true,
  className = '',
}: {
  src: string
  width: number
  height: number
  alt: string
  caption?: ReactNode
  priority?: boolean
  sizes?: string
  mount?: boolean
  className?: string
}) {
  return (
    <figure className={className}>
      <div
        className={
          mount
            ? 'flex justify-center bg-mount px-[6%] pb-[9%] pt-[6%]'
            : 'flex justify-center'
        }
      >
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className="block h-auto w-full"
          style={{ maxWidth: width }}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 font-sans text-xs text-ink-mute">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
