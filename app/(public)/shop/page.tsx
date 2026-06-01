import type { Metadata } from 'next'
import { SectionHeading } from '@/components/SectionHeading'
import { ProductCard } from '@/components/shop/ProductCard'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { ShopProduct } from '@/lib/shop/types'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Books and fine art prints from the Charlie Rogers archive. By Onesign & Digital.',
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
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Charlie Rogers"
        title="Shop"
        intro="Books and fine art prints of Charlie Rogers' work. Each print is reproduced from the archive and supports the work of keeping his record of Tyneside alive."
      />

      <div className="mt-12">
        {products.length === 0 ? (
          <div className="border border-dashed border-rule bg-paper-warm/50 p-10 text-center">
            <p className="font-serif text-h3">The shop is opening soon</p>
            <p className="mt-3 max-w-reading mx-auto font-serif text-body text-ink-soft">
              The first listings are being photographed and written up. In the
              meantime, the book is available to read about, and the full archive
              of paintings is free to browse.
            </p>
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
