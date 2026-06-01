'use client'

import { useState } from 'react'
import { cn, shopImageUrl } from '@/lib/shop/utils'
import type { ShopProductImage } from '@/lib/shop/types'

// Primary image plus a thumbnail rail. On a warm mount, consistent with the
// rest of the site's painting treatment.
export function ProductImageGallery({
  images,
  title,
}: {
  images: ShopProductImage[]
  title: string
}) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = sorted[activeIndex] ?? sorted[0]

  if (!active) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-paper-warm font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
        No image
      </div>
    )
  }

  const activeUrl = shopImageUrl(active.storage_path)

  return (
    <div className="space-y-3">
      <div className="bg-paper-warm p-4">
        {activeUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeUrl}
            alt={active.alt_text ?? title}
            className="block w-full h-auto"
          />
        )}
      </div>

      {sorted.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {sorted.map((img, i) => {
            const url = shopImageUrl(img.storage_path)
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'block w-full bg-paper-warm p-1 border-2 transition-colors',
                    i === activeIndex
                      ? 'border-bensham'
                      : 'border-transparent hover:border-rule',
                  )}
                  aria-label={`View image ${i + 1} of ${sorted.length}`}
                  aria-current={i === activeIndex}
                >
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt=""
                      className="block aspect-square w-full object-cover"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
