import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { ClearBasket } from '@/components/shop/ClearBasket'
import { OrderTotals } from '@/components/shop/OrderSummary'
import { fetchOrderForCustomer, ORDER_STATUS_LABELS } from '@/lib/shop/orders'
import { formatPence } from '@/lib/shop/utils'

export const metadata: Metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
  // The URL carries the access token. Keep it out of any Referer header sent
  // to another site from this page.
  referrer: 'no-referrer',
}

export const dynamic = 'force-dynamic'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { number } = await params
  const { t } = await searchParams
  const order = await fetchOrderForCustomer(decodeURIComponent(number), t ?? '')
  if (!order) notFound()

  const placed = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'Europe/London' }).format(
    new Date(order.created_at),
  )
  const a = order.shipping_address

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <ClearBasket />
      <Eyebrow>Order {order.order_number}</Eyebrow>
      <h1 className="mt-4 font-serif text-h1">Thank you, {order.customer_name.split(' ')[0]}</h1>
      <p className="mt-6 max-w-reading font-serif text-lead text-ink-soft">
        {order.status === 'pending'
          ? order.payment_provider === 'manual'
            ? `Your order is reserved. No payment has been taken yet: we will email ${order.customer_email} to arrange payment and confirm postage before anything is sent.`
            : 'Your order is reserved while payment is confirmed.'
          : order.status === 'cancelled'
            ? 'This order has been cancelled.'
            : 'Your order is confirmed. Thank you for supporting the Charlie Rogers archive.'}
      </p>
      <p className="mt-4 font-sans text-small text-ink-mute">
        Keep this page's address if you would like to check the order again.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <ul className="border-t border-rule">
            {order.items.map((item) => (
              <li key={item.product_slug} className="flex justify-between gap-4 border-b border-rule py-4">
                <span className="font-serif text-body">
                  {item.product_title}
                  <span className="font-sans text-small text-ink-mute"> &times; {item.quantity}</span>
                </span>
                <span className="font-serif text-body">{formatPence(item.line_total_pence)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 max-w-sm">
            <OrderTotals subtotalPence={order.subtotal_pence} postagePence={order.postage_pence} totalPence={order.total_pence} />
          </div>
        </section>

        <aside className="self-start border border-rule bg-paper-warm p-6 lg:col-span-5">
          <dl className="space-y-5">
            <div>
              <dt className="input-label">Status</dt>
              <dd className="font-serif text-body">{ORDER_STATUS_LABELS[order.status]}</dd>
            </div>
            <div>
              <dt className="input-label">Placed</dt>
              <dd className="font-serif text-body">{placed}</dd>
            </div>
            <div>
              <dt className="input-label">Posting to</dt>
              <dd className="font-serif text-body">
                {[order.customer_name, a.line1, a.line2, a.town, a.county, a.postcode]
                  .filter(Boolean)
                  .map((l, i) => (
                    <span key={i} className="block">
                      {l}
                    </span>
                  ))}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-14">
        <Button href="/work" variant="secondary">
          Browse the paintings
        </Button>
      </div>
    </div>
  )
}
