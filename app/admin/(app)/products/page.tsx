import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPrice, shopImageUrl, cn } from '@/lib/shop/utils'
import { productWarnings } from '@/lib/shop/product-input'
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
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  // Validated against STATUSES rather than cast. ?status=foo used to reach the
  // empty state, where PRODUCT_STATUS_LABELS['foo'] is undefined and the
  // .toLowerCase() on it threw, so a typed URL crashed the page.
  const filter: ProductStatus | 'all' =
    STATUSES.find((s) => s.value === status)?.value ?? 'all'
  const search = (q ?? '').trim()

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(id, storage_path, is_primary, display_order)')
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })

  if (filter !== 'all') query = query.eq('status', filter)
  if (search) {
    // Escape the PostgREST pattern wildcards so a title containing % or _ is
    // searched for literally rather than matching half the shop.
    const escaped = search.replace(/[%_]/g, (m) => `\\${m}`)
    query = query.ilike('title', `%${escaped}%`)
  }

  const { data, error } = await query
  const products = (data as ShopProduct[] | null) ?? []

  const keepParams = (next: { status?: string; q?: string }) => {
    const params = new URLSearchParams()
    const s = next.status ?? (filter === 'all' ? '' : filter)
    const term = next.q ?? search
    if (s) params.set('status', s)
    if (term) params.set('q', term)
    const qs = params.toString()
    return qs ? `/admin/products?${qs}` : '/admin/products'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1">Products</h1>
          <p className="mt-1 font-sans text-small text-ink-mute">
            Books, prints and originals. Featured listings sort first.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-admin">
          New listing
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s.value}
              href={keepParams({ status: s.value === 'all' ? '' : s.value })}
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

        {/* A plain GET form, so search works without JavaScript and the result
            is a shareable URL rather than hidden component state. */}
        <form method="get" action="/admin/products" className="ml-auto flex items-center gap-2">
          {filter !== 'all' && <input type="hidden" name="status" value={filter} />}
          <label htmlFor="q" className="sr-only">
            Search by title
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search titles"
            className="input w-48"
          />
          <button type="submit" className="btn-admin-outline">
            Search
          </button>
          {search && (
            <Link
              href={keepParams({ q: '' })}
              className="font-sans text-small text-ink-soft hover:text-bensham"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham"
        >
          Could not load products: {error.message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="border border-dashed border-rule bg-paper p-10 text-center">
          <p className="font-serif text-h3">
            {search
              ? `Nothing matches "${search}"`
              : filter === 'all'
                ? 'No products yet'
                : `No ${PRODUCT_STATUS_LABELS[filter].toLowerCase()} listings`}
          </p>
          <p className="mt-2 font-sans text-small text-ink-mute">
            {search
              ? 'Try a shorter search, or clear it to see everything.'
              : 'Add your first listing to get the shop started.'}
          </p>
          {!search && (
            <Link href="/admin/products/new" className="btn-admin mt-5">
              New listing
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-rule bg-paper">
          <table className="w-full font-sans text-small">
            <caption className="sr-only">
              Shop listings, {products.length} shown
            </caption>
            <thead className="bg-paper-warm text-left font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Type</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {products.map((p) => {
                const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0]
                const thumbUrl = primary ? shopImageUrl(primary.storage_path) : null
                const warnings = productWarnings({
                  status: p.status,
                  price_pence: p.price_pence,
                  stock_count: p.stock_count,
                  imageCount: p.images?.length ?? 0,
                  description: p.description,
                })
                return (
                  <tr key={p.id} className="hover:bg-paper-warm/50">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden bg-paper-warm">
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-eyebrow text-ink-mute">
                            None
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
                      {p.status === 'published' && (
                        <a
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 font-sans text-xs text-ink-mute hover:text-bensham"
                        >
                          View
                        </a>
                      )}
                      {warnings.length > 0 && (
                        <span className="mt-1 block font-sans text-xs text-ochre">
                          {warnings.join('. ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {PRODUCT_TYPE_LABELS[p.product_type]}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatPrice(p.price_pence)}</td>
                    <td className="px-4 py-3 text-ink-soft">{p.stock_count}</td>
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
