import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPence, shopImageUrl, cn } from '@/lib/shop/utils'
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  type ShopProduct,
  type ProductStatus,
} from '@/lib/shop/types'

const STATUSES: Array<{ value: ProductStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
]

const STATUS_COLOURS: Record<ProductStatus, string> = {
  draft: 'bg-paper-warm text-ink-soft',
  published: 'bg-sage/20 text-ink',
  sold: 'bg-bensham text-paper',
  archived: 'bg-rule text-ink-soft',
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter = (status ?? 'all') as ProductStatus | 'all'

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(storage_path, is_primary, display_order)')
    .order('updated_at', { ascending: false })

  if (filter !== 'all') query = query.eq('status', filter)

  const { data, error } = await query
  const products = (data as ShopProduct[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1">Products</h1>
          <p className="mt-1 font-sans text-small text-ink-mute">
            Manage books, prints, and originals.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-admin">
          New listing
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/admin/products' : `/admin/products?status=${s.value}`}
            className={cn(
              'border px-3 py-1.5 font-sans text-xs uppercase tracking-eyebrow transition-colors',
              filter === s.value
                ? 'border-bensham bg-bensham text-paper'
                : 'border-rule text-ink-soft hover:bg-paper-warm',
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          Could not load products: {error.message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="border border-dashed border-rule bg-paper p-10 text-center">
          <p className="font-serif text-h3">No products yet</p>
          <p className="mt-2 font-sans text-small text-ink-mute">
            Add your first listing to get the shop started.
          </p>
          <Link href="/admin/products/new" className="btn-admin mt-5">
            New listing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-rule bg-paper">
          <table className="w-full font-sans text-small">
            <thead className="bg-paper-warm text-left font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {products.map((p) => {
                const primary =
                  p.images?.find((i) => i.is_primary) ?? p.images?.[0]
                const thumbUrl = primary ? shopImageUrl(primary.storage_path) : null
                return (
                  <tr key={p.id} className="hover:bg-paper-warm/50">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden bg-paper-warm">
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-eyebrow text-ink-mute">
                            No img
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-serif text-body text-ink hover:text-bensham"
                      >
                        {p.title}
                      </Link>
                      {p.is_featured && (
                        <span className="ml-2 font-sans text-xs uppercase tracking-eyebrow text-ochre">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {PRODUCT_TYPE_LABELS[p.product_type]}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatPence(p.price_pence)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2 py-1 font-sans text-xs uppercase tracking-eyebrow',
                          STATUS_COLOURS[p.status],
                        )}
                      >
                        {PRODUCT_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-mute">
                      {new Date(p.updated_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
