import Link from 'next/link'
import { formatPrice, shopImageUrl, cn } from '@/lib/shop/utils'
import { PRODUCT_TYPE_LABELS, type ShopProduct } from '@/lib/shop/types'

export function ProductCard({ product }: { product: ShopProduct }) {
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0] ?? null
  const imgUrl = primary ? shopImageUrl(primary.storage_path) : null
  const sold = product.status === 'sold'

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      {/* Fixed aspect box so titles sit on a common baseline across a row.
          The painting is contained, never cropped: these are artworks, and
          Charlie's signature sits in a corner on most of them. */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-paper-warm p-3">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={primary?.alt_text ?? product.title}
            loading="lazy"
            className={cn(
              'block max-h-full max-w-full object-contain',
              sold && 'opacity-70',
            )}
          />
        ) : (
          <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
            Image to come
          </span>
        )}
        {sold && (
          <span className="absolute right-4 top-4 bg-bensham px-2 py-1 font-sans text-xs uppercase tracking-eyebrow text-paper">
            Sold
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-serif text-h4 group-hover:text-bensham transition-colors">
          {product.title}
        </h3>
        <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
          {PRODUCT_TYPE_LABELS[product.product_type]}
        </p>
        <p className="mt-1 font-serif text-body text-ink">
          {formatPrice(product.price_pence)}
        </p>
      </div>
    </Link>
  )
}
