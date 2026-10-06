import type { CheckoutDetails } from './checkout-input'
import type { Quote } from './commerce'
import type { PlacedOrder } from './payments'
import { formatPence } from './utils'

// Tell the shop a new order has come in, by email through Resend. Without it
// a manual order would sit in the admin with nobody knowing to look.
//
// Best effort and optional: unset RESEND_API_KEY, SHOP_EMAIL_FROM or
// SHOP_ORDER_NOTIFY_EMAIL and this does nothing. A failed send is logged and
// never fails the order, which is already saved by the time this runs. Plain
// fetch rather than the Resend SDK, so there is no dependency for one call.
export async function notifyShopOfOrder(order: PlacedOrder, details: CheckoutDetails, quote: Quote): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.SHOP_EMAIL_FROM
  const to = process.env.SHOP_ORDER_NOTIFY_EMAIL
  if (!key || !from || !to) return

  const a = details.address
  const text = [
    `Order ${order.orderNumber}`,
    '',
    ...quote.lines.map((l) => `${l.quantity} x ${l.title}, ${formatPence(l.lineTotalPence)}`),
    '',
    `Subtotal ${formatPence(quote.subtotalPence)}`,
    `Postage ${quote.postagePence === null ? 'to be confirmed' : formatPence(quote.postagePence)}`,
    `Total ${formatPence(order.totalPence)}`,
    '',
    details.name,
    details.email,
    details.phone ?? '',
    [a.line1, a.line2, a.town, a.county, a.postcode].filter(Boolean).join(', '),
    '',
    details.notes ? `Note: ${details.notes}` : '',
    'No payment has been taken. Mark the order paid in the admin once it has.',
  ]
    .filter((l, i, all) => l !== '' || all[i - 1] !== '')
    .join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: details.email, subject: `New order ${order.orderNumber}`, text }),
    })
    if (!res.ok) console.error(`[shop] order notification for ${order.orderNumber} failed: ${res.status}`)
  } catch (err) {
    console.error(`[shop] order notification for ${order.orderNumber} failed:`, err)
  }
}
