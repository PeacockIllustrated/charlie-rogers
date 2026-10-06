import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ORDER_COLUMNS, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/lib/shop/orders'
import { formatPence, cn } from '@/lib/shop/utils'
import { setOrderStatus } from './actions'

const FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Awaiting payment' },
  { value: 'paid', label: 'To post' },
  { value: 'shipped', label: 'Posted' },
  { value: 'cancelled', label: 'Cancelled' },
]

// The next sensible steps from each status. The database refuses to reopen a
// cancelled order whatever this offers.
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'refunded', 'cancelled'],
  shipped: ['completed', 'refunded'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  paid: 'Mark paid',
  shipped: 'Mark posted',
  completed: 'Mark completed',
  refunded: 'Mark refunded',
  cancelled: 'Cancel and return stock',
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter = FILTERS.find((f) => f.value === status)?.value ?? 'all'

  const supabase = await createSupabaseServerClient()
  let query = supabase.from('charlie_orders').select(ORDER_COLUMNS).order('created_at', { ascending: false }).limit(200)
  if (filter !== 'all') query = query.eq('status', filter)
  const { data, error } = await query
  const orders = (data as Order[] | null) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-h1">Orders</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          Newest first. Stock is reserved when an order is placed and returned if it is cancelled.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/orders' : `/admin/orders?status=${f.value}`}
            className={cn(
              'border px-3 py-1.5 font-sans text-xs uppercase tracking-eyebrow transition-colors',
              filter === f.value ? 'border-bensham bg-bensham text-paper' : 'border-rule text-ink-soft hover:bg-paper-warm',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <div role="alert" className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          Could not load orders: {error.message}
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="border border-rule bg-paper p-10">
          <p className="font-serif text-h3">No orders {filter === 'all' ? 'yet' : 'here'}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const a = o.shipping_address
            return (
              <li key={o.id} className="border border-rule bg-paper p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-serif text-h4">
                    {o.order_number}
                    <span className="ml-3 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </p>
                  <p className="font-sans text-small text-ink-mute">
                    {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(o.created_at))}
                  </p>
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-3">
                  <ul className="space-y-1 font-sans text-small md:col-span-1">
                    {o.items.map((i) => (
                      <li key={i.product_slug}>
                        {i.quantity} &times; {i.product_title}
                      </li>
                    ))}
                    <li className="pt-2 text-ink-soft">
                      Total {formatPence(o.total_pence)}
                      {o.postage_pence === null && ', postage to add'}
                    </li>
                  </ul>
                  <div className="font-sans text-small text-ink-soft">
                    <p className="text-ink">{o.customer_name}</p>
                    <p>
                      <a href={`mailto:${o.customer_email}?subject=${encodeURIComponent(`Your order ${o.order_number}`)}`} className="underline underline-offset-4 hover:text-bensham">
                        {o.customer_email}
                      </a>
                    </p>
                    {o.customer_phone && <p>{o.customer_phone}</p>}
                  </div>
                  <div className="font-sans text-small text-ink-soft">
                    {[a.line1, a.line2, a.town, a.county, a.postcode].filter(Boolean).map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                </div>

                {o.notes && <p className="mt-4 border-l-2 border-rule pl-3 font-serif text-body text-ink-soft whitespace-pre-wrap">{o.notes}</p>}

                {NEXT[o.status].length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4">
                    {NEXT[o.status].map((next) => (
                      <form key={next} action={setOrderStatus}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value={next} />
                        <button type="submit" className={next === 'cancelled' || next === 'refunded' ? 'btn-admin-outline' : 'btn-admin'}>
                          {ACTION_LABELS[next]}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
