import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { Button } from '@/components/Button'
import { ProductCard } from '@/components/shop/ProductCard'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { CATALOGUE } from '@/lib/shop/catalogue'
import type { ShopProduct } from '@/lib/shop/types'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'The book about Charlie Rogers, and, in time, fine art prints of his paintings.',
  robots: { index: false, follow: false },
}

export default async function ShopPage() {
  let products: ShopProduct[] = []

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('charlie_products')
      .select('*, images:charlie_product_images(*)')
      .in('status', ['published', 'sold'])
      .order('is_featured', { ascending: false })
      .order('updated_at', { ascending: false })
    products = (data as ShopProduct[] | null) ?? []
  } else {
    // No database yet, so fall back to the local catalogue. This exists so the
    // shop can be reviewed before Supabase is pointed at; the live tables win
    // the moment they are configured.
    products = [...CATALOGUE].sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured),
    )
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Shop"
        intro="The book about Charlie Rogers, and fine art prints of his paintings. There is no checkout yet, so everything here is by enquiry."
      />

      <div className="mt-12">
        {products.length === 0 ? (
          // Empty state holds the same left-aligned reading measure as the
          // heading above it. A centred dashed panel reads as an admin
          // template, and dashed rules appear nowhere in DESIGN.md.
          <div className="max-w-reading border-t border-rule pt-8">
            <h2 className="font-serif text-h3">The shop is opening soon</h2>
            <p className="mt-3 font-serif text-body text-ink-soft">
              The first listings are being photographed and written up. In the
              meantime, the book is available to read about, and the full
              archive of paintings is free to browse.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/book">Read about the book</Button>
              <Button href="/work" variant="secondary">
                Browse the paintings
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
