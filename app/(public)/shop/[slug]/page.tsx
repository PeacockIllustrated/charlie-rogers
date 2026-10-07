import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { BackLink } from '@/components/BackLink'
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'
import { PrintSpecifications } from '@/components/shop/PrintSpecifications'
import { formatPrice, cn } from '@/lib/shop/utils'
import { PRODUCT_TYPE_LABELS, type ShopProduct } from '@/lib/shop/types'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { catalogueBySlug } from '@/lib/shop/catalogue'
import { purchasability, maxQuantity } from '@/lib/shop/commerce'
import { AddToBasket } from '@/components/shop/AddToBasket'
import { isCheckoutOpen } from '@/lib/shop/checkout-open'

async function fetchProduct(slug: string): Promise<ShopProduct | null> {
  // No database yet, so fall back to the local catalogue. See lib/shop/catalogue.ts.
  if (!isSupabaseConfigured()) return catalogueBySlug(slug)
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(*)')
    .eq('slug', slug)
    .in('status', ['published', 'sold'])
    .maybeSingle()

  if (error) {
    // A failed query is not the same as a missing product. Returning null here
    // would render a 404 for a page that exists, which is worse than showing
    // the catalogue copy, and it would do so with nothing in the logs.
    console.error(`[shop] query failed for "${slug}", using local catalogue:`, error.message)
    return catalogueBySlug(slug)
  }

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
  const saleable = purchasability(product)
  // Out of stock is "sold out" only for things that are sold online; a print
  // at stock 0 is by enquiry, not sold out.
  const soldOut = !saleable.ok && saleable.reason === 'sold-out'
  // Offer the basket only when an order can actually be placed. Until then the
  // book and the cards fall back to enquiry like everything else, so nobody
  // fills a basket they cannot check out.
  const canAdd = saleable.ok && (await isCheckoutOpen())
  // Read literally: Next inlines NEXT_PUBLIC_ variables by matching source text.
  const enquiryEmail = process.env.NEXT_PUBLIC_ENQUIRY_EMAIL

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

        {/* The details sit on a warm panel beside the picture, like a label
            card beside a hung work */}
        <div className="self-start border border-rule bg-paper-warm p-6 sm:p-8">
          <Eyebrow>{PRODUCT_TYPE_LABELS[product.product_type]}</Eyebrow>
          <h1 className="mt-3 font-serif text-h1">{product.title}</h1>

          <p
            className={cn(
              'mt-4 font-serif text-h3 text-bensham',
              (isSold || soldOut) && 'line-through opacity-60',
            )}
          >
            {formatPrice(product.price_pence)}
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

          {/* The book and the card pack go in the basket. Everything else,
              the paintings above all, is by enquiry: the files we hold are not
              print quality (see lib/shop/commerce.ts), so nothing here may be
              bought online until high resolution scans arrive.

              The enquiry address comes from the environment because none of
              the people involved has been asked which one to publish. Unset,
              the page says plainly that enquiries are not open rather than
              offering a button that does nothing. */}
          <div className="mt-8">
            {canAdd ? (
              <AddToBasket slug={product.slug} title={product.title} maxQuantity={maxQuantity(product)} />
            ) : isSold || soldOut ? (
              <>
                <p className="inline-block border border-rule px-4 py-2 font-sans text-small uppercase tracking-eyebrow text-ink-mute">
                  {isSold ? 'Sold' : 'Sold out'}
                </p>
                <p className="mt-3 font-sans text-small text-ink-mute">
                  {isSold
                    ? 'This piece has been sold. It stays listed as part of the record.'
                    : 'Every copy has been ordered. It stays listed as part of the record.'}
                </p>
              </>
            ) : (
              <>
                {enquiryEmail && (
                  <Button
                    href={`mailto:${enquiryEmail}?subject=${encodeURIComponent(`Enquiry: ${product.title}`)}`}
                    variant="primary"
                  >
                    Enquire about this
                  </Button>
                )}
                <p className="mt-3 font-sans text-small text-ink-mute">
                  {enquiryEmail
                    ? 'This is not sold online yet, so enquiries go by email.'
                    : 'This is not sold online yet, and no enquiry address has been set.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Only on prints. The specification is about how a print is made, so it
          has no bearing on the book or the greeting cards. */}
      {product.product_type === 'print' && (
        <div className="mt-16">
          <PrintSpecifications />
        </div>
      )}
    </div>
  )
}
