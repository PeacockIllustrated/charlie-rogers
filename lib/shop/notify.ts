import type { CheckoutDetails } from './checkout-input'
import type { EnquiryDetails } from './enquiry-input'
import { displayTitle, type Quote } from './commerce'
import { confirmationPath, type PlacedOrder } from './payments'
import { SITE_URL } from '@/lib/site'
import { formatPence } from './utils'

// How this deployment sends email. Two ways are supported:
//
// - Make: the "client sites · send email" scenario in OneDesign's Make
//   account, which already sends for other client sites. The site posts to its
//   webhook with a client name and key; the scenario's Charlie route checks the
//   key, sets the from address and sends. Needs MAKE_EMAIL_WEBHOOK_URL and
//   MAKE_EMAIL_KEY.
// - Resend: needs RESEND_API_KEY and SHOP_EMAIL_FROM.
//
// Make is used when both its values are set. Without either pair every email
// below is skipped, which used to happen silently: an enquiry was saved and
// nobody was told (Tom's test enquiry, 13 November 2026). Now each skip is
// logged, and the admin dashboard and Settings say so in plain words.
type Transport = 'make' | 'resend'

function transport(): Transport | null {
  if (process.env.MAKE_EMAIL_WEBHOOK_URL && process.env.MAKE_EMAIL_KEY) return 'make'
  if (process.env.RESEND_API_KEY && process.env.SHOP_EMAIL_FROM) return 'resend'
  return null
}

export function emailSetup(): { ok: boolean; missing: string[]; via: Transport | null } {
  const via = transport()
  if (via) return { ok: true, missing: [], via }
  const make = ['MAKE_EMAIL_WEBHOOK_URL', 'MAKE_EMAIL_KEY'].filter((k) => !process.env[k])
  return { ok: false, missing: make, via: null }
}

interface Mail {
  to: string
  subject: string
  text: string
  replyTo?: string | null
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// The Make route sends HTML, so plain text is escaped and its line breaks kept.
const asHtml = (text: string) =>
  `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#1d1a17">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`

// Send one email by whichever transport is set up. Resolves to null when it
// was accepted, or a short reason when it was not. Never throws.
async function deliver(mail: Mail): Promise<string | null> {
  const via = transport()
  if (!via) return 'email is not set up'
  try {
    const res =
      via === 'make'
        ? await fetch(process.env.MAKE_EMAIL_WEBHOOK_URL as string, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client: 'charlie',
              key: process.env.MAKE_EMAIL_KEY,
              to: mail.to,
              subject: mail.subject,
              html: asHtml(mail.text),
              replyTo: mail.replyTo ?? '',
            }),
          })
        : await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: process.env.SHOP_EMAIL_FROM,
              to: mail.to,
              subject: mail.subject,
              text: mail.text,
              ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
            }),
          })
    if (res.ok) return null
    const body = await res.text().catch(() => '')
    return `${via === 'make' ? 'Make' : 'Resend'} refused it (${res.status}). ${body.slice(0, 300)}`
  } catch (err) {
    return `Could not reach ${via === 'make' ? 'Make' : 'Resend'}: ${String(err)}`
  }
}

async function send(mail: Mail, what: string): Promise<void> {
  const failed = await deliver(mail)
  if (failed) console.error(`[shop] ${what} failed: ${failed}`)
}

function skipped(what: string, to: string | null): boolean {
  const { ok, missing } = emailSetup()
  if (!ok) {
    console.warn(`[shop] ${what} not emailed: ${missing.join(' and ')} (or RESEND_API_KEY and SHOP_EMAIL_FROM) not set in the hosting environment`)
    return true
  }
  if (!to) {
    console.warn(`[shop] ${what} not emailed: no "Send new orders and enquiries to" address in Admin > Settings`)
    return true
  }
  return false
}

// A plain test message from Admin > Settings, so whoever runs the shop can see
// that email works before a customer relies on it. Returns what the sender said.
export async function sendTestEmail(to: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { ok, missing } = emailSetup()
  if (!ok) return { ok: false, reason: `${missing.join(' and ')} not set in the hosting environment (Vercel).` }
  const failed = await deliver({
    to,
    subject: 'Charlie Rogers shop: test email',
    text: 'This is a test from Admin > Settings. If you are reading it, order and enquiry emails will reach this address.',
  })
  return failed ? { ok: false, reason: failed } : { ok: true }
}

// Tell the shop a new order has come in, by email. Without it
// a manual order would sit in the admin with nobody knowing to look.
//
// Best effort and optional: without email set up (see emailSetup), or a
// notification address at /admin/settings, this does nothing. A failed send is
// logged and never fails the order, which is already saved by the time this
// runs. Plain fetch, so there is no dependency for one call.
export async function notifyShopOfOrder(
  to: string | null,
  order: PlacedOrder,
  details: CheckoutDetails,
  quote: Quote,
): Promise<void> {
  if (skipped(`order ${order.orderNumber}`, to) || !to) return

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

  await send({ to, replyTo: details.email, subject: `New order ${order.orderNumber}`, text }, `order notification for ${order.orderNumber}`)
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
  if (skipped(`enquiry about ${enquiry.productSlug}`, to) || !to) return

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

  await send(
    { to, replyTo: details.email, subject: `Enquiry: ${enquiry.productTitle}`, text },
    `enquiry notification for ${enquiry.productSlug}`,
  )
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
  if (skipped(`customer receipt for ${order.orderNumber}`, shopEmail)) return
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
    { to: details.email, replyTo: shopEmail, subject: `Your Charlie Rogers order ${order.orderNumber}`, text },
    `customer receipt for ${order.orderNumber}`,
  )
}
