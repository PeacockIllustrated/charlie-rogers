import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ProductForm,
  type ProductFormInitial,
} from '@/components/admin/ProductForm'
import type { ShopProduct, ShopProductImage } from '@/lib/shop/types'

export const metadata = { title: 'Edit product' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: product } = await supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(*)')
    .eq('id', id)
    .maybeSingle()

  if (!product) notFound()

  const typed = product as ShopProduct & { images: ShopProductImage[] }
  const sortedImages = [...(typed.images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  )

  const initial: ProductFormInitial = {
    id: typed.id,
    title: typed.title,
    description: typed.description ?? '',
    price_gbp: (typed.price_pence / 100).toFixed(2),
    product_type: typed.product_type,
    status: typed.status,
    medium: typed.medium ?? '',
    dimensions: typed.dimensions ?? '',
    year_text: typed.year_text ?? '',
    edition: typed.edition ?? '',
    stock_count: typed.stock_count.toString(),
    is_featured: typed.is_featured,
    images: sortedImages.map((img, i) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      display_order: i,
      is_primary: i === 0,
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute hover:text-bensham"
        >
          Products
        </Link>
        <h1 className="mt-2 font-serif text-h1">Edit listing</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          {typed.status === 'published'
            ? 'Live in the shop.'
            : `Status: ${typed.status}`}
        </p>
      </div>
      <ProductForm mode="edit" initial={initial} />
    </div>
  )
}
