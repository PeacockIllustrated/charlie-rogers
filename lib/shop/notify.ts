import type { CheckoutDetails } from './checkout-input'
import type { EnquiryDetails } from './enquiry-input'
import { displayTitle, type Quote } from './commerce'
import { confirmationPath, type PlacedOrder } from './payments'
import { SITE_URL } from '@/lib/site'
import { formatPence } from './utils'

// Tell the shop a new order has come in, by email through Resend. Without it
// a manual order would sit in the admin with nobody knowing to look.
//
// Best effort and optional: without RESEND_API_KEY and SHOP_EMAIL_FROM in the
// environment, or a notification address at /admin/settings, this does nothing. A failed send is logged and
// never fails the order, which is already saved by the time this runs. Plain
// fetch rather than the Resend SDK, so there is no dependency for one call.
export async function notifyShopOfOrder(
  to: string | null,
  order: PlacedOrder,
  details: CheckoutDetails,
  quote: Quote,
): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.SHOP_EMAIL_FROM
  if (!key || !from || !to) return

  const a = details.address
  const text = [
    `Order ${order.orderNumber}`,
    '',
    ...orderLines(quote),
    `Total ${formatPence(order.totalPence)}`,
    '',
    details.name,
    details.email,
    details.phone ?? '',
    [a.line1, a.line2, a.town, a.county, a.postcode].filter(Boolean).join(', '),
    '',
    details.notes ? `Note: ${details.notes}` : '',
    'No payment has been taken. The customer has been emailed to say you will be in touch to arrange payment. Reply to this email to reach them, and mark the order paid in the admin once it has been.',
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

// Tell the admins someone has asked about a product. Same rules as the order
// email: optional, best effort, and never fails the enquiry, which is already
// saved and waiting at /admin/enquiries. Reply-to is the customer, so
// answering the email answers them.
export async function notifyShopOfEnquiry(
  to: string | null,
  enquiry: { productTitle: string; productSlug: string; adminUrl: string | null },
  details: EnquiryDetails,
): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.SHOP_EMAIL_FROM
  if (!key || !from || !to) return

  const text = [
    `New enquiry about ${enquiry.productTitle}`,
    '',
    details.message,
    '',
    details.name,
    details.email,
    details.phone ?? '',
    '',
    'Reply to this email to answer them directly.',
    enquiry.adminUrl ? `Every enquiry is also listed at ${enquiry.adminUrl}` : 'Every enquiry is also listed in the admin, under Enquiries.',
  ]
    .filter((l, i, all) => l !== '' || all[i - 1] !== '')
    .join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: details.email, subject: `Enquiry: ${enquiry.productTitle}`, text }),
    })
    if (!res.ok) console.error(`[shop] enquiry notification for ${enquiry.productSlug} failed: ${res.status}`)
  } catch (err) {
    console.error(`[shop] enquiry notification for ${enquiry.productSlug} failed:`, err)
  }
}

function postageText(pence: number | null): string {
  return pence === null ? 'to be confirmed' : pence === 0 ? 'free' : formatPence(pence)
}

function orderLines(quote: Quote): string[] {
  return [
    ...quote.lines.map((l) => `${l.quantity} x ${displayTitle(l.title, l.optionName)}, ${formatPence(l.lineTotalPence)}`),
    '',
    `Subtotal ${formatPence(quote.subtotalPence)}`,
    `UK postage ${postageText(quote.postagePence)}`,
  ]
}

async function send(payload: Record<string, unknown>, what: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error(`[shop] ${what} failed: ${res.status}`)
  } catch (err) {
    console.error(`[shop] ${what} failed:`, err)
  }
}

// The customer's receipt for an order taken without online payment. Until
// Stripe is added this is how they learn the order arrived and what happens
// next. Same rules as the shop's own email: optional, best effort, never fails
// the order. Reply-to is the shop's notification address, so a reply reaches
// a person; without one there is nobody to reply to, so nothing is sent and
// the confirmation page carries the message alone.
export async function notifyCustomerOfOrder(
  shopEmail: string | null,
  order: PlacedOrder,
  details: CheckoutDetails,
  quote: Quote,
): Promise<void> {
  const from = process.env.SHOP_EMAIL_FROM
  if (!process.env.RESEND_API_KEY || !from || !shopEmail) return

  const a = details.address
  const firstName = details.name.split(' ')[0]
  const text = [
    `Dear ${firstName},`,
    '',
    `Thank you for your order, ${order.orderNumber}.`,
    '',
    ...orderLines(quote),
    `${quote.postagePence === null ? 'Total before postage' : 'Total'} ${formatPence(order.totalPence)}`,
    '',
    quote.postagePence === null
      ? 'No payment has been taken. We will email you shortly to arrange payment and confirm the postage. Nothing is sent until payment has been received.'
      : 'No payment has been taken. We will email you shortly to arrange payment. Nothing is sent until payment has been received.',
    '',
    'Posting to:',
    [details.name, a.line1, a.line2, a.town, a.county, a.postcode].filter(Boolean).join(', '),
    '',
    `You can see your order at any time here: ${SITE_URL}${confirmationPath(order)}`,
    '',
    'If anything is wrong, or you have a question, reply to this email.',
    '',
    'Charlie Rogers, Pursued by Bulldozers',
  ].join('\n')

  await send(
    { from, to: details.email, reply_to: shopEmail, subject: `Your Charlie Rogers order ${order.orderNumber}`, text },
    `customer receipt for ${order.orderNumber}`,
  )
}
