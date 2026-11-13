// What each shop email says. notify.ts gathers the order or enquiry and sends
// these; email-layout.ts gives them the book's look. Kept pure, with plain
// inputs, so the wording can be tested and previewed without Next or Supabase.

import type { EmailDoc } from './email-layout'

export interface EmailLine {
  label: string
  pence: number
}

export interface EmailOrder {
  orderNumber: string
  lines: EmailLine[]
  subtotalPence: number
  // null while the postage is still to be confirmed.
  postagePence: number | null
  totalPence: number
}

export interface EmailCustomer {
  name: string
  email: string
  phone: string | null
  address: string[]
  notes: string | null
}

export interface Built {
  subject: string
  doc: EmailDoc
}

export const pounds = (pence: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100)

const postageText = (pence: number | null) => (pence === null ? 'To be confirmed' : pence === 0 ? 'Free' : pounds(pence))

function orderRows(order: EmailOrder) {
  return [
    ...order.lines.map((l) => ({ label: l.label, value: pounds(l.pence) })),
    { label: 'UK postage', value: postageText(order.postagePence) },
    {
      label: order.postagePence === null ? 'Total before postage' : 'Total',
      value: pounds(order.totalPence),
      total: true,
    },
  ]
}

export function testEmail(): Built {
  return {
    subject: 'Charlie Rogers shop: test email',
    doc: {
      audience: 'shop',
      preheader: 'Order and enquiry emails will reach this address.',
      eyebrow: 'Admin, settings',
      title: 'Email is working',
      blocks: [
        { kind: 'p', text: 'This is the test sent from Admin > Settings. If you are reading it, new orders and enquiries from charlierogers.art will reach this address.' },
        {
          kind: 'panel',
          title: 'What arrives here',
          text: 'A notice for every new order, with what was ordered and where it is going.\nA notice for every enquiry. Reply to it and your answer goes straight to the customer.',
        },
        { kind: 'p', text: 'Customers get their own receipt in this same style, so it is worth placing a test order before Christmas to see one.' },
      ],
    },
  }
}

export function shopOrderEmail(order: EmailOrder, customer: EmailCustomer, adminUrl: string): Built {
  return {
    subject: `New order ${order.orderNumber}`,
    doc: {
      audience: 'shop',
      preheader: `${customer.name}, ${pounds(order.totalPence)}. Payment to arrange.`,
      eyebrow: `New order, ${order.orderNumber}`,
      title: `${customer.name.split(' ')[0]} has placed an order`,
      blocks: [
        { kind: 'lines', rows: orderRows(order) },
        {
          kind: 'panel',
          title: 'Next step',
          text: 'No payment has been taken. The customer has been told you will be in touch. Reply to this email to ask for payment, then mark the order paid in the admin.',
        },
        { kind: 'details', title: 'Customer', lines: [customer.name, customer.email, customer.phone ?? ''] },
        { kind: 'details', title: 'Post to', lines: customer.address },
        ...(customer.notes ? [{ kind: 'quote' as const, text: customer.notes }] : []),
        { kind: 'button', label: 'Open the order', href: adminUrl },
      ],
    },
  }
}

export function shopEnquiryEmail(
  enquiry: { productTitle: string; message: string; name: string; email: string; phone: string | null },
  adminUrl: string,
): Built {
  return {
    subject: `Enquiry: ${enquiry.productTitle}`,
    doc: {
      audience: 'shop',
      preheader: `${enquiry.name} has asked about ${enquiry.productTitle}.`,
      eyebrow: 'New enquiry',
      title: enquiry.productTitle,
      blocks: [
        { kind: 'quote', text: enquiry.message },
        { kind: 'details', title: 'From', lines: [enquiry.name, enquiry.email, enquiry.phone ?? ''] },
        { kind: 'panel', text: 'Reply to this email and your answer goes straight to them.' },
        { kind: 'button', label: 'See all enquiries', href: adminUrl },
      ],
    },
  }
}

export function customerReceiptEmail(order: EmailOrder, customer: EmailCustomer, orderUrl: string): Built {
  const first = customer.name.trim().split(/\s+/)[0] ?? customer.name
  return {
    subject: `Your Charlie Rogers order ${order.orderNumber}`,
    doc: {
      audience: 'customer',
      preheader: `Thank you for your order. No payment has been taken yet.`,
      eyebrow: `Order ${order.orderNumber}`,
      title: 'Thank you for your order',
      blocks: [
        { kind: 'p', text: `Dear ${first},` },
        { kind: 'p', text: 'Your order has arrived safely and everything on it is put aside for you.' },
        { kind: 'lines', rows: orderRows(order) },
        {
          kind: 'panel',
          title: 'What happens next',
          text:
            order.postagePence === null
              ? 'No payment has been taken. We will email you shortly to arrange payment and confirm the postage. Nothing is sent until payment has been received.'
              : 'No payment has been taken. We will email you shortly to arrange payment. Nothing is sent until payment has been received.',
        },
        { kind: 'details', title: 'Posting to', lines: [customer.name, ...customer.address] },
        { kind: 'button', label: 'View your order', href: orderUrl },
        { kind: 'p', text: 'If anything is wrong, or you have a question, reply to this email.' },
      ],
    },
  }
}
