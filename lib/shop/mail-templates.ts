// Ready-written emails the admin opens in their own mail program, from the
// Orders and Enquiries pages. Until Stripe is added, payment is arranged by
// email, so these save typing the same order summary over and over.
//
// They open as mailto links rather than sending from the site: the admin
// reads and edits each one, adds payment details, and sends it from their own
// address, so the customer's reply comes straight back to them.
//
// Pure, so it can be tested without Next or Supabase.

// Same as displayTitle in commerce.ts. Repeated rather than imported so this
// file runs under the test runner, which needs import paths with extensions.
const displayTitle = (title: string, optionName: string | null) =>
  optionName ? `${title}, ${optionName.toLowerCase()}` : title

interface OrderLike {
  order_number: string
  customer_name: string
  customer_email: string
  subtotal_pence: number
  postage_pence: number | null
  total_pence: number
  items: Array<{ product_title: string; option_name: string | null; quantity: number; line_total_pence: number }>
}

interface EnquiryLike {
  name: string
  email: string
  product_title: string
  message: string
}

export interface MailDraft {
  to: string
  subject: string
  body: string
}

const pounds = (pence: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100)

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

function summary(order: OrderLike): string[] {
  return [
    ...order.items.map((i) => `${i.quantity} x ${displayTitle(i.product_title, i.option_name)}, ${pounds(i.line_total_pence)}`),
    order.postage_pence === null
      ? 'UK postage: [ADD POSTAGE, then save it on the order in the admin]'
      : `UK postage: ${order.postage_pence === 0 ? 'free' : pounds(order.postage_pence)}`,
    `Total: ${pounds(order.total_pence)}${order.postage_pence === null ? ' plus postage' : ''}`,
  ]
}

const SIGN_OFF = ['', 'Kind regards,', '', 'Charlie Rogers, Pursued by Bulldozers']

export function paymentRequestMail(order: OrderLike): MailDraft {
  return {
    to: order.customer_email,
    subject: `Your Charlie Rogers order ${order.order_number}: payment`,
    body: [
      `Dear ${firstName(order.customer_name)},`,
      '',
      `Thank you for your order, ${order.order_number}. It is reserved for you:`,
      '',
      ...summary(order),
      '',
      'To pay, [ADD PAYMENT DETAILS: bank transfer details with the order number as the reference, or a payment link].',
      '',
      'We will post your order as soon as payment arrives.',
      ...SIGN_OFF,
    ].join('\n'),
  }
}

export function postedMail(order: OrderLike): MailDraft {
  return {
    to: order.customer_email,
    subject: `Your Charlie Rogers order ${order.order_number} is on its way`,
    body: [
      `Dear ${firstName(order.customer_name)},`,
      '',
      `Your order ${order.order_number} has been posted today.`,
      '',
      ...order.items.map((i) => `${i.quantity} x ${displayTitle(i.product_title, i.option_name)}`),
      '',
      '[ADD TRACKING NUMBER, if there is one]',
      '',
      'Thank you for supporting the Charlie Rogers archive.',
      ...SIGN_OFF,
    ].join('\n'),
  }
}

export function enquiryReplyMail(enquiry: EnquiryLike): MailDraft {
  const quoted = enquiry.message
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n')
  return {
    to: enquiry.email,
    subject: `Re: ${enquiry.product_title}`,
    body: [
      `Dear ${firstName(enquiry.name)},`,
      '',
      `Thank you for your enquiry about ${enquiry.product_title}.`,
      '',
      '',
      ...SIGN_OFF,
      '',
      'You wrote:',
      quoted,
    ].join('\n'),
  }
}

// mailto with a subject and body. Line breaks are encoded as %0D%0A, which
// every common mail program reads as a new line.
export function mailtoHref(draft: MailDraft): string {
  const enc = (s: string) => encodeURIComponent(s).replace(/%0A/g, '%0D%0A')
  return `mailto:${encodeURIComponent(draft.to).replace(/%40/g, '@')}?subject=${enc(draft.subject)}&body=${enc(draft.body)}`
}
