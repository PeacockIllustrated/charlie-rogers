import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ShopProduct } from '@/lib/shop/types'

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('charlie_products')
    .select('id, status')

  const products = (data as Pick<ShopProduct, 'id' | 'status'>[] | null) ?? []
  const count = (status: ShopProduct['status']) =>
    products.filter((p) => p.status === status).length

  const stats = [
    { label: 'Published', value: count('published') },
    { label: 'Drafts', value: count('draft') },
    { label: 'Sold', value: count('sold') },
    { label: 'Total', value: products.length },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-h1">Dashboard</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          Manage the shop listings for the Charlie Rogers site.
        </p>
      </div>

      <div className="grid gap-px bg-rule sm:grid-cols-4 border border-rule">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper p-5">
            <div className="font-serif text-h2">{s.value}</div>
            <div className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Link href="/admin/products/new" className="btn-admin">
          New listing
        </Link>
        <Link
          href="/admin/products"
          className="ml-3 font-sans text-small text-ink-soft hover:text-bensham"
        >
          View all products
        </Link>
      </div>
    </div>
  )
}
