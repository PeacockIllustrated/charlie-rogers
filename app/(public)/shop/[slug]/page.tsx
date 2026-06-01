import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { BackLink } from '@/components/BackLink'
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'
import { formatPence, cn } from '@/lib/shop/utils'
import { PRODUCT_TYPE_LABELS, type ShopProduct } from '@/lib/shop/types'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'

async function fetchProduct(slug: string): Promise<ShopProduct | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(*)')
    .eq('slug', slug)
    .in('status', ['published', 'sold'])
    .maybeSingle()
  return (data as ShopProduct | null) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) return { title: 'Product not found', robots: { index: false } }
  return {
    title: product.meta_title ?? product.title,
    description:
      product.meta_description ?? product.description?.slice(0, 160) ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) notFound()

  const isSold = product.status === 'sold'

  const spec: Array<{ label: string; value: string }> = []
  spec.push({ label: 'Type', value: PRODUCT_TYPE_LABELS[product.product_type] })
  if (product.medium) spec.push({ label: 'Medium', value: product.medium })
  if (product.dimensions) spec.push({ label: 'Dimensions', value: product.dimensions })
  if (product.year_text) spec.push({ label: 'Year', value: product.year_text })
  if (product.edition) spec.push({ label: 'Edition', value: product.edition })

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <BackLink href="/shop">All products</BackLink>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <ProductImageGallery images={product.images ?? []} title={product.title} />
        </div>

        <div>
          <Eyebrow>{PRODUCT_TYPE_LABELS[product.product_type]}</Eyebrow>
          <h1 className="mt-3 font-serif text-h1">{product.title}</h1>

          <p
            className={cn(
              'mt-4 font-serif text-h3 text-bensham',
              isSold && 'line-through opacity-60',
            )}
          >
            {formatPence(product.price_pence)}
          </p>

          {product.description && (
            <div className="mt-6 max-w-reading font-serif text-body-lg text-ink-soft whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {spec.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 border-t border-rule pt-5">
              {spec.map((s) => (
                <div key={s.label}>
                  <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-serif text-body text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            {isSold ? (
              <Button href="#" variant="secondary">
                Sold
              </Button>
            ) : (
              <Button href="/book" variant="primary">
                Enquire about this
              </Button>
            )}
            <p className="mt-3 font-sans text-small text-ink-mute">
              Online checkout is coming soon. To enquire, contact{' '}
              <Link href="/book" className="text-ink hover:text-bensham">
                the gallery
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
