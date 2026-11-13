// Run with: pnpm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderEmailHtml, renderEmailText } from '../lib/shop/email-layout.ts'
import { customerReceiptEmail, shopEnquiryEmail, testEmail } from '../lib/shop/email-content.ts'

const order = {
  orderNumber: 'CR-1',
  lines: [{ label: '1 x Bensham Road, limited edition', pence: 12000 }],
  subtotalPence: 12000,
  postagePence: null,
  totalPence: 12000,
}
const customer = { name: 'Ann Lee', email: 'a@example.com', phone: null, address: ['1 High St', 'NE8 1AA'], notes: null }

test('customer input is escaped in the HTML', () => {
  const html = renderEmailHtml(
    shopEnquiryEmail({ productTitle: 'Pop', message: '<script>x</script> & "hi"', name: 'A', email: 'a@b.c', phone: null }, 'https://x').doc,
  )
  assert.ok(!html.includes('<script>x'))
  assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt; &amp; &quot;hi&quot;'))
})

test('receipt says postage is to be confirmed when it is not set', () => {
  const { doc, subject } = customerReceiptEmail(order, customer, 'https://x/o')
  assert.equal(subject, 'Your Charlie Rogers order CR-1')
  const text = renderEmailText(doc)
  assert.match(text, /UK postage, To be confirmed/)
  assert.match(text, /Total before postage: £120\.00/)
  assert.match(text, /Dear Ann,/)
})

test('house copy rules: no exclamation marks or em-dashes', () => {
  for (const built of [testEmail(), customerReceiptEmail(order, customer, 'https://x/o')]) {
    const text = renderEmailText(built.doc)
    assert.ok(!text.includes('!'))
    assert.ok(!text.includes('—'))
  }
})
