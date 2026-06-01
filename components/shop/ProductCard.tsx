import Link from 'next/link'
import { formatPence, shopImageUrl, cn } from '@/lib/shop/utils'
import { PRODUCT_TYPE_LABELS, type ShopProduct } from '@/lib/shop/types'

export function ProductCard({ product }: { product: ShopProduct }) {
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0] ?? null
  const imgUrl = primary ? shopImageUrl(primary.storage_path) : null
  const sold = product.status === 'sold'

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative bg-paper-warm p-3">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={primary?.alt_text ?? product.title}
            loading="lazy"
            className={cn('block w-full h-auto', sold && 'opacity-70')}
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
            No image
          </div>
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
          {formatPence(product.price_pence)}
        </p>
      </div>
    </Link>
  )
}
