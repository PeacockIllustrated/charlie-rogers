import Link from 'next/link'
import { Roundel } from '@/components/Roundel'
import { Frame } from '@/components/Frame'
import { displayPrice, formatPence, shopImageUrl, cn } from '@/lib/shop/utils'
import type { ShopProduct } from '@/lib/shop/types'

// One product, hung on a wall in its frame, with a gallery label beneath.
// The picture is contained, never cropped: these are artworks, and Charlie's
// signature sits in a corner on most of them.
export function ProductCard({
  product,
  size = 'md',
}: {
  product: ShopProduct
  // Cards are hung smaller than prints.
  size?: 'sm' | 'md'
}) {
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0] ?? null
  const imgUrl = primary ? shopImageUrl(primary.storage_path) : null
  const sold = product.status === 'sold'
  const editions = (product.options ?? [])
    .filter((o) => o.is_active)
    .sort((a, b) => a.display_order - b.display_order)
  const meta = [product.year_text, product.medium].filter(Boolean).join(', ')

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex h-full min-w-0 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bensham"
    >
      {/* A wall of fixed height so labels line up across a row, whatever the
          shape of the picture. The picture's height cap leaves room for the
          frame inside it. */}
      <div
        className={cn(
          'frame-wall relative flex items-center justify-center transition-colors duration-colour group-hover:bg-[#e6dcc8]',
          size === 'sm' ? 'h-44 p-3 sm:h-64 sm:p-6' : 'h-48 p-3 sm:h-80 sm:p-8',
        )}
      >
        {imgUrl ? (
          <Frame size="sm" className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transform-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={primary?.alt_text ?? product.title}
              loading="lazy"
              className={cn(
                '!w-auto max-w-full',
                size === 'sm' ? 'max-h-24 sm:max-h-36' : 'max-h-28 sm:max-h-48',
                sold && 'opacity-70',
              )}
            />
          </Frame>
        ) : (
          // No photograph yet: the book's roundel stands in, which is what the
          // special edition carries on its cover.
          <Roundel size={140} tone={product.product_type === 'book' ? 'bensham' : 'ink'} />
        )}
        {sold && (
          <span className="absolute right-3 top-3 bg-bensham px-2 py-1 font-sans text-xs uppercase tracking-eyebrow text-paper">
            Sold
          </span>
        )}
      </div>

      {/* The gallery label. */}
      <div className="flex flex-1 flex-col border-b border-rule pb-5 pt-4">
        <h3 className="font-serif text-body leading-snug sm:text-h4 transition-colors duration-colour group-hover:text-bensham">
          {product.title}
        </h3>
        {meta && <p className="mt-1 font-sans text-xs text-ink-mute">{meta}</p>}
        <div className="mt-auto pt-3">
          {editions.length > 1 ? (
            <p className="flex flex-col gap-y-1 font-serif text-small text-ink sm:flex-row sm:flex-wrap sm:gap-x-4 sm:text-body">
              {editions.map((e) => (
                <span key={e.code}>
                  <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">{e.name} </span>
                  {formatPence(e.price_pence)}
                </span>
              ))}
            </p>
          ) : (
            <p className="font-serif text-body text-ink">{displayPrice(product)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
