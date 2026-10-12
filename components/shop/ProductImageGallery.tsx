'use client'

import { useState } from 'react'
import { cn, shopImageUrl } from '@/lib/shop/utils'
import type { ProductType, ShopProductImage } from '@/lib/shop/types'
import { Roundel } from '@/components/Roundel'

// Primary image plus a thumbnail rail. On a warm mount, consistent with the
// rest of the site's painting treatment.
export function ProductImageGallery({
  images,
  title,
  productType,
}: {
  images: ShopProductImage[]
  title: string
  productType?: ProductType
}) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = sorted[activeIndex] ?? sorted[0]

  if (!active) {
    // No photograph of the book yet. Rather than an empty box, set it as the
    // book is set: the embossed emblem on the wine red of its headers, with
    // the title in Bembo. Captioned, so nobody takes it for a photograph.
    if (productType === 'book') {
      return (
        <figure>
          <div className="flex aspect-[4/5] flex-col items-center justify-center gap-10 bg-bensham px-8 text-center text-paper">
            <Roundel size={200} tone="paper" title="The Charlie Rogers emblem, as embossed on the special edition" />
            <div>
              <p className="font-sans text-xs uppercase tracking-eyebrow text-paper/80">Charlie Rogers</p>
              <p className="mt-3 font-serif text-h2 italic">Pursued by Bulldozers</p>
              <p className="mt-3 font-sans text-xs uppercase tracking-eyebrow text-paper/80">Brian Rankin</p>
            </div>
          </div>
          <figcaption className="mt-3 font-sans text-xs text-ink-mute">
            A photograph of the signed special edition is to come.
          </figcaption>
        </figure>
      )
    }
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-paper-warm">
        <Roundel size={160} tone="ink" />
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
                  // The card pack's five thumbnails are five different
                  // paintings, so "image 2 of 5" tells a screen reader nothing
                  // useful. Use the caption where there is one. Trimmed, not
                  // null-checked: the thumbnail itself is alt="", so a caption
                  // of "" or "   " would leave the button with no name at all.
                  aria-label={
                    img.alt_text?.trim() || `View image ${i + 1} of ${sorted.length}`
                  }
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
