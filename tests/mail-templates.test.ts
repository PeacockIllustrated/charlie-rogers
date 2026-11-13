// Run with: pnpm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paymentRequestMail, postedMail, enquiryReplyMail, mailtoHref } from '../lib/shop/mail-templates.ts'

const order = {
  order_number: 'CR-2026-0007',
  customer_name: 'Ann Rogers',
  customer_email: 'ann@example.com',
  subtotal_pence: 12295,
  postage_pence: null,
  total_pence: 12295,
  items: [
    { product_title: 'Pop', option_name: 'Limited edition', quantity: 1, line_total_pence: 12000 },
    { product_title: 'Greeting card, Bensham Road, Gateshead', option_name: null, quantity: 1, line_total_pence: 295 },
  ],
}

test('the payment email lists the order and leaves a gap for payment details', () => {
  const m = paymentRequestMail(order)
  assert.equal(m.to, 'ann@example.com')
  assert.match(m.subject, /CR-2026-0007/)
  assert.match(m.body, /^Dear Ann,/)
  assert.match(m.body, /1 x Pop, limited edition, £120\.00/)
  assert.match(m.body, /ADD POSTAGE/)
  assert.match(m.body, /Total: £122\.95 plus postage/)
  assert.match(m.body, /ADD PAYMENT DETAILS/)
  assert.doesNotMatch(m.body, /!/)
})

test('free postage reads as free, and the posted email names what was sent', () => {
  const m = paymentRequestMail({ ...order, postage_pence: 0 })
  assert.match(m.body, /UK postage: free/)
  assert.match(postedMail(order).body, /has been posted today/)
})

test('the enquiry reply quotes the message', () => {
  const m = enquiryReplyMail({ name: 'Joan Pattinson', email: 'j@example.com', product_title: 'Town Moor', message: 'Line one\nLine two' })
  assert.equal(m.subject, 'Re: Town Moor')
  assert.match(m.body, /> Line one\n> Line two/)
})

test('mailtoHref encodes the subject and uses CRLF line breaks', () => {
  const href = mailtoHref({ to: 'a@b.com', subject: 'Hi & bye', body: 'a\nb' })
  assert.equal(href, 'mailto:a@b.com?subject=Hi%20%26%20bye&body=a%0D%0Ab')
})
