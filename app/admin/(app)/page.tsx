import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productWarnings } from '@/lib/shop/product-input'
import { PRODUCT_STATUS_LABELS, type ShopProduct, type ShopProductOption } from '@/lib/shop/types'
import { formatPence, cn } from '@/lib/shop/utils'
import { ORDER_COLUMNS, type Order } from '@/lib/shop/orders'
import { ENQUIRY_COLUMNS, type Enquiry } from '@/lib/shop/enquiries'
import { displayTitle } from '@/lib/shop/commerce'
import { emailSetup } from '@/lib/shop/notify'
import { canStoreOrders } from '@/lib/shop/orders'

export const dynamic = 'force-dynamic'

type Row = Pick<
  ShopProduct,
  'id' | 'title' | 'slug' | 'status' | 'product_type' | 'price_pence' | 'stock_count' | 'description' | 'updated_at'
> & { images: { id: string }[]; options?: ShopProductOption[] }

// Money that has come in: anything paid, posted or done.
const TAKEN = new Set(['paid', 'shipped', 'completed'])
// Below this many left, stock is worth a mention on the dashboard.
const LOW_STOCK = 10

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: { href: string; label: string }
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('border border-rule bg-paper', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule px-5 py-4">
        <h2 className="font-serif text-h3">{title}</h2>
        {action && (
          <Link href={action.href} className="font-sans text-small text-ink-soft hover:text-bensham">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-6 font-sans text-small text-ink-mute">{children}</p>
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()

  const [productsRes, ordersRes, settingsRes, enquiriesRes, optionsRes] = await Promise.all([
    supabase
      .from('charlie_products')
      .select('id, title, slug, status, product_type, price_pence, stock_count, description, updated_at, images:charlie_product_images(id)')
      .order('updated_at', { ascending: false }),
    supabase.from('charlie_orders').select(ORDER_COLUMNS).order('created_at', { ascending: false }).limit(500),
    supabase.from('charlie_shop_settings').select('checkout_mode, uk_postage_pence, order_notify_email').eq('id', true).maybeSingle(),
    supabase.from('charlie_enquiries').select(ENQUIRY_COLUMNS, { count: 'exact' }).eq('status', 'new').order('created_at', { ascending: false }).limit(5),
    // Separate from the products query so a database without the editions
    // migration still shows the rest of the dashboard.
    supabase.from('charlie_product_options').select('*'),
  ])

  const products = (productsRes.data as Row[] | null) ?? []
  const options = (optionsRes.data as ShopProductOption[] | null) ?? []
  const orders = (ordersRes.data as Order[] | null) ?? []
  const enquiries = (enquiriesRes.data as Enquiry[] | null) ?? []
  const newEnquiryCount = enquiriesRes.error ? null : (enquiriesRes.count ?? enquiries.length)
  const settings = settingsRes.data as { checkout_mode: string; uk_postage_pence: number | null; order_notify_email: string | null } | null
  const email = emailSetup()

  // ---------------------------------------------------------------- ready
  // Everything that has to be true before a customer's order reaches anyone.
  const checks = [
    {
      label: 'Orders can be saved',
      ok: canStoreOrders() && !ordersRes.error,
      fix: ordersRes.error ? 'Apply the orders migration in Supabase.' : 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel.',
      href: '/admin/settings',
    },
    {
      label: 'Emails are being sent',
      ok: email.ok,
      fix: `Not yet: ${email.missing.join(' and ')} missing in Vercel. Orders and enquiries are saved here, but nobody is emailed.`,
      href: '/admin/settings',
    },
    {
      label: 'Orders and enquiries go to an address',
      ok: Boolean(settings?.order_notify_email),
      fix: 'Add one under "Send new orders and enquiries to".',
      href: '/admin/settings',
    },
    {
      label: 'Prints can be ordered in their editions',
      ok: !optionsRes.error && options.length > 0,
      fix: optionsRes.error ? 'Apply migration 20261113090000 in Supabase.' : 'No print has editions yet.',
      href: '/admin/products',
    },
    {
      label: 'Checkout is open',
      ok: settings?.checkout_mode === 'manual',
      fix: 'Closed: everything is by enquiry. Open it in Settings when the rest is ready.',
      href: '/admin/settings',
    },
    {
      label: 'UK postage is set',
      ok: settings?.uk_postage_pence !== null && settings?.uk_postage_pence !== undefined,
      fix: 'Customers see postage "to be confirmed" on the book and cards. Prints are free either way.',
      href: '/admin/settings',
    },
  ]
  const ready = checks.every((c) => c.ok)

  // ---------------------------------------------------------------- orders
  const awaitingPayment = orders.filter((o) => o.status === 'pending')
  const toPost = orders.filter((o) => o.status === 'paid')
  const taken = orders.filter((o) => TAKEN.has(o.status))
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const takenThisMonth = taken.filter((o) => new Date(o.created_at) >= monthStart)
  const sum = (list: Order[]) => list.reduce((n, o) => n + o.total_pence, 0)

  // What has sold, by product and edition, across every order not cancelled.
  const sold = new Map<string, { title: string; quantity: number; pence: number }>()
  for (const o of orders) {
    if (o.status === 'cancelled' || o.status === 'refunded') continue
    for (const i of o.items) {
      const title = displayTitle(i.product_title, i.option_name)
      const prev = sold.get(title) ?? { title, quantity: 0, pence: 0 }
      sold.set(title, { title, quantity: prev.quantity + i.quantity, pence: prev.pence + i.line_total_pence })
    }
  }
  const bestSellers = [...sold.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 6)

  // ---------------------------------------------------------------- stock
  const productById = new Map(products.map((p) => [p.id, p]))
  const lowStock: Array<{ id: string; label: string; left: number }> = []
  for (const o of options) {
    const p = productById.get(o.product_id)
    if (!p || p.status !== 'published' || !o.is_active || o.stock_count === null) continue
    if (o.stock_count <= LOW_STOCK) lowStock.push({ id: p.id, label: displayTitle(p.title, o.name), left: o.stock_count })
  }
  for (const p of products) {
    if (p.status !== 'published' || (p.product_type !== 'book' && p.product_type !== 'other')) continue
    if (p.price_pence > 0 && p.stock_count <= LOW_STOCK) lowStock.push({ id: p.id, label: p.title, left: p.stock_count })
  }
  lowStock.sort((a, b) => a.left - b.left)

  const optionsByProduct = new Set(options.map((o) => o.product_id))
  const flagged = products
    .map((p) => {
      const warnings = productWarnings({
        status: p.status,
        product_type: p.product_type,
        price_pence: p.price_pence,
        stock_count: p.stock_count,
        imageCount: p.images?.length ?? 0,
        description: p.description,
      })
      if (!optionsRes.error && p.status === 'published' && p.product_type === 'print' && p.price_pence > 0 && !optionsByProduct.has(p.id)) {
        warnings.push('Priced print with no editions, so it cannot be ordered')
      }
      return { product: p, warnings }
    })
    .filter((f) => f.warnings.length > 0)

  const count = (status: ShopProduct['status']) => products.filter((p) => p.status === status).length
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' }).format(new Date())

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">{today}</p>
          <h1 className="mt-2 font-serif text-h1">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/shop" target="_blank" rel="noreferrer" className="font-sans text-small text-ink-soft hover:text-bensham">
            View the shop
          </a>
          <Link href="/admin/products/new" className="btn-admin">
            New listing
          </Link>
        </div>
      </div>

      {productsRes.error && (
        <div role="alert" className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          Could not load products: {productsRes.error.message}
        </div>
      )}

      {/* Is the shop able to take an order and tell someone about it. Shown
          in full until every line is ticked, then folds to one line. */}
      {ready ? (
        <p className="border border-rule border-l-4 border-l-sage bg-paper px-5 py-3 font-sans text-small text-ink">
          The shop is open and taking orders. Emails go to {settings?.order_notify_email}.
        </p>
      ) : (
        <Panel title="Ready for orders" action={{ href: '/admin/settings', label: 'Settings' }} className="border-t-2 border-t-bensham">
          <ul className="divide-y divide-rule">
            {checks.map((c) => (
              <li key={c.label} className="grid grid-cols-[1.5rem_1fr] gap-x-3 px-5 py-3 sm:grid-cols-[1.5rem_16rem_1fr]">
                <span aria-hidden className={cn('font-sans text-body leading-6', c.ok ? 'text-sage' : 'text-bensham')}>
                  {c.ok ? '✓' : '○'}
                </span>
                <span className="font-sans text-small font-medium leading-6 text-ink">
                  {c.label}
                  <span className="sr-only">{c.ok ? ', done' : ', not yet'}</span>
                </span>
                {!c.ok && (
                  <Link href={c.href} className="col-start-2 font-sans text-small leading-6 text-ink-soft hover:text-bensham sm:col-start-3">
                    {c.fix}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* The numbers, each a way in to the list behind it. */}
      {!ordersRes.error && (
        <div className="grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4">
          {[
            { label: 'Awaiting payment', value: String(awaitingPayment.length), sub: awaitingPayment.length ? formatPence(sum(awaitingPayment)) : 'None', href: '/admin/orders?status=pending', urgent: awaitingPayment.length > 0 },
            { label: 'To post', value: String(toPost.length), sub: toPost.length ? 'Paid, waiting to go' : 'None', href: '/admin/orders?status=paid', urgent: toPost.length > 0 },
            { label: 'Enquiries to answer', value: newEnquiryCount === null ? 'Not set up' : String(newEnquiryCount), sub: newEnquiryCount ? 'Waiting for a reply' : 'None', href: '/admin/enquiries', urgent: (newEnquiryCount ?? 0) > 0 },
            { label: 'Taken this month', value: formatPence(sum(takenThisMonth)), sub: `${formatPence(sum(taken))} in all, ${taken.length} ${taken.length === 1 ? 'order' : 'orders'}`, href: '/admin/orders', urgent: false },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="group bg-paper p-5 transition-colors hover:bg-paper-warm">
              <div className={cn('font-serif text-h2 tabular-nums', s.urgent && 'text-bensham')}>{s.value}</div>
              <div className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">{s.label}</div>
              <div className="mt-1 font-sans text-small text-ink-soft">{s.sub}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel title="Waiting on you" action={{ href: '/admin/orders', label: 'All orders' }}>
          {ordersRes.error ? (
            <Empty>Orders are not set up in the database yet. Apply 20261006150000_charlie-shop-orders.sql.</Empty>
          ) : awaitingPayment.length + toPost.length === 0 ? (
            <Empty>No order is waiting. New orders appear here as soon as they are placed.</Empty>
          ) : (
            <ul className="divide-y divide-rule">
              {[...awaitingPayment, ...toPost].slice(0, 8).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders?status=${o.status}#order-${o.id}`}
                    className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-3 transition-colors hover:bg-paper-warm"
                  >
                    <span className="font-serif text-body text-ink">
                      {o.order_number}
                      <span className="ml-2 font-sans text-small text-ink-soft">{o.customer_name}</span>
                    </span>
                    <span className="text-right font-serif text-body tabular-nums text-ink">{formatPence(o.total_pence)}</span>
                    <span className="truncate font-sans text-small text-ink-mute">
                      {o.items.map((i) => `${i.quantity} x ${displayTitle(i.product_title, i.option_name)}`).join(', ')}
                    </span>
                    <span
                      className={cn(
                        'text-right font-sans text-xs uppercase tracking-eyebrow',
                        o.status === 'pending' ? 'text-bensham' : 'text-ochre',
                      )}
                    >
                      {o.status === 'pending' ? 'Ask for payment' : 'Post it'}, {ago(o.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="New enquiries" action={{ href: '/admin/enquiries', label: 'All enquiries' }}>
          {newEnquiryCount === null ? (
            <Empty>Enquiries are not set up in the database yet. Apply 20261012090000_charlie-shop-enquiries.sql.</Empty>
          ) : enquiries.length === 0 ? (
            <Empty>Nothing waiting for a reply.</Empty>
          ) : (
            <ul className="divide-y divide-rule">
              {enquiries.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/enquiries#enquiry-${q.id}`} className="block px-5 py-3 transition-colors hover:bg-paper-warm">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-serif text-body text-ink">
                        {q.name}
                        <span className="ml-2 font-sans text-small text-ink-soft">about {q.product_title}</span>
                      </span>
                      <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">{ago(q.created_at)}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 block font-serif text-body text-ink-soft">{q.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel title="What has sold">
          {bestSellers.length === 0 ? (
            <Empty>Nothing yet. Each product and edition is counted here once it is ordered.</Empty>
          ) : (
            <table className="w-full font-sans text-small">
              <thead className="sr-only">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {bestSellers.map((b) => (
                  <tr key={b.title}>
                    <td className="px-5 py-3 font-serif text-body text-ink">{b.title}</td>
                    <td className="py-3 text-right tabular-nums text-ink-soft">{b.quantity}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{formatPence(b.pence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Stock running low" action={{ href: '/admin/products', label: 'Products' }}>
          {lowStock.length === 0 ? (
            <Empty>
              Nothing under {LOW_STOCK} left. Limited editions count down from fifty; standard prints are made to order.
            </Empty>
          ) : (
            <ul className="divide-y divide-rule">
              {lowStock.map((s) => (
                <li key={s.label}>
                  <Link href={`/admin/products/${s.id}/edit#editions`} className="flex items-baseline justify-between gap-4 px-5 py-3 transition-colors hover:bg-paper-warm">
                    <span className="font-serif text-body text-ink">{s.label}</span>
                    <span className={cn('font-sans text-small tabular-nums', s.left === 0 ? 'text-bensham' : 'text-ochre')}>
                      {s.left === 0 ? 'Sold out' : `${s.left} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {flagged.length > 0 && (
        <Panel title="Listings to check" action={{ href: '/admin/products', label: 'All products' }}>
          <ul className="divide-y divide-rule">
            {flagged.map(({ product, warnings }) => (
              <li key={product.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3">
                <Link href={`/admin/products/${product.id}/edit`} className="font-serif text-body text-ink hover:text-bensham">
                  {product.title}
                </Link>
                <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">{PRODUCT_STATUS_LABELS[product.status]}</span>
                <span className="font-sans text-small text-ochre">{warnings.join('. ')}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <p className="font-sans text-small text-ink-mute">
        {count('published')} listed in the shop, {count('draft')} in draft, {count('sold')} sold, {count('archived')} archived.{' '}
        <Link href="/admin/products" className="underline underline-offset-4 hover:text-bensham">
          Manage products
        </Link>
      </p>
    </div>
  )
}
