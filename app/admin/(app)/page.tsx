import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productWarnings } from '@/lib/shop/product-input'
import { PRODUCT_STATUS_LABELS, type ShopProduct } from '@/lib/shop/types'
import { formatPence } from '@/lib/shop/utils'

type Row = Pick<
  ShopProduct,
  'id' | 'title' | 'status' | 'product_type' | 'price_pence' | 'stock_count' | 'description' | 'updated_at'
> & { images: { id: string }[] }

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('charlie_products')
    .select(
      'id, title, status, product_type, price_pence, stock_count, description, updated_at, images:charlie_product_images(id)',
    )
    .order('updated_at', { ascending: false })

  // Orders and settings arrive with the orders migration. Until it is applied
  // both queries fail, and the dashboard says so rather than showing zeros.
  const [ordersRes, settingsRes] = await Promise.all([
    supabase.from('charlie_orders').select('status, total_pence').in('status', ['pending', 'paid']),
    supabase.from('charlie_shop_settings').select('checkout_mode, uk_postage_pence').eq('id', true).maybeSingle(),
  ])
  const openOrders = (ordersRes.data as Array<{ status: string; total_pence: number }> | null) ?? []
  const awaitingPayment = openOrders.filter((o) => o.status === 'pending')
  const toPost = openOrders.filter((o) => o.status === 'paid')
  const settings = settingsRes.data as { checkout_mode: string; uk_postage_pence: number | null } | null
  const ordersReady = !ordersRes.error && !settingsRes.error && settings !== null

  const products = (data as Row[] | null) ?? []

  const count = (status: ShopProduct['status']) =>
    products.filter((p) => p.status === status).length

  // Counters are links. A number you cannot click is a number you have to go
  // and look up again somewhere else.
  const stats = [
    { label: 'Published', value: count('published'), href: '/admin/products?status=published' },
    { label: 'Drafts', value: count('draft'), href: '/admin/products?status=draft' },
    { label: 'Sold', value: count('sold'), href: '/admin/products?status=sold' },
    { label: 'Archived', value: count('archived'), href: '/admin/products?status=archived' },
  ]

  const flagged = products
    .map((p) => ({
      product: p,
      warnings: productWarnings({
        status: p.status,
        product_type: p.product_type,
        price_pence: p.price_pence,
        stock_count: p.stock_count,
        imageCount: p.images?.length ?? 0,
        description: p.description,
      }),
    }))
    .filter((f) => f.warnings.length > 0)

  const recent = products.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1">Dashboard</h1>
          <p className="mt-1 font-sans text-small text-ink-mute">
            Orders, listings and settings for the Charlie Rogers shop.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/shop"
            target="_blank"
            rel="noreferrer"
            className="font-sans text-small text-ink-soft hover:text-bensham"
          >
            View the shop
          </a>
          <Link href="/admin/products/new" className="btn-admin">
            New listing
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham"
        >
          Could not load products: {error.message}
        </div>
      )}

      {/* Orders first: they are the thing with a customer waiting on them. */}
      <section className="border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4">
          <h2 className="font-serif text-h3">Orders</h2>
          {ordersReady && (
            <Link href="/admin/settings" className="font-sans text-small text-ink-soft hover:text-bensham">
              Checkout is {settings?.checkout_mode === 'manual' ? 'open, payment by arrangement' : 'closed'}
              {settings?.checkout_mode === 'manual' && settings.uk_postage_pence === null && ', postage not set'}
            </Link>
          )}
        </div>
        {ordersReady ? (
          <div className="grid gap-px bg-rule sm:grid-cols-2">
            <Link href="/admin/orders?status=pending" className="bg-paper p-5 transition-colors hover:bg-paper-warm">
              <div className="font-serif text-h2">{awaitingPayment.length}</div>
              <div className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                Awaiting payment
                {awaitingPayment.length > 0 && `, ${formatPence(awaitingPayment.reduce((n, o) => n + o.total_pence, 0))}`}
              </div>
            </Link>
            <Link href="/admin/orders?status=paid" className="bg-paper p-5 transition-colors hover:bg-paper-warm">
              <div className="font-serif text-h2">{toPost.length}</div>
              <div className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">To post</div>
            </Link>
          </div>
        ) : (
          <p className="px-5 py-6 font-sans text-small text-ink-mute">
            Orders are not set up in the database yet. Apply the migration
            20261006150000_charlie-shop-orders.sql to turn them on.
          </p>
        )}
      </section>

      <div className="grid gap-px bg-rule sm:grid-cols-4 border border-rule">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-paper p-5 transition-colors hover:bg-paper-warm"
          >
            <div className="font-serif text-h2">{s.value}</div>
            <div className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      {/* The point of a dashboard is to say what needs doing, not to restate
          what is already on the products page. A listing that is public with no
          image, or marked sold while stock remains, is the sort of thing nobody
          notices until a customer does. */}
      <section className="border border-rule bg-paper">
        <div className="border-b border-rule px-5 py-4">
          <h2 className="font-serif text-h3">Needs attention</h2>
        </div>
        {flagged.length === 0 ? (
          <p className="px-5 py-6 font-sans text-small text-ink-mute">
            Nothing to flag. Every published listing has an image, a price, a
            description and stock.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {flagged.map(({ product, warnings }) => (
              <li key={product.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-serif text-body text-ink hover:text-bensham"
                >
                  {product.title}
                </Link>
                <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                  {PRODUCT_STATUS_LABELS[product.status]}
                </span>
                <span className="font-sans text-small text-ochre">
                  {warnings.join('. ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-rule bg-paper">
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 className="font-serif text-h3">Recently updated</h2>
          <Link
            href="/admin/products"
            className="font-sans text-small text-ink-soft hover:text-bensham"
          >
            All products
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-6 font-sans text-small text-ink-mute">
            No listings yet.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {recent.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="font-serif text-body text-ink hover:text-bensham"
                >
                  {p.title}
                </Link>
                <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                  {PRODUCT_STATUS_LABELS[p.status]}
                  {' · '}
                  {new Date(p.updated_at).toLocaleDateString('en-GB')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
