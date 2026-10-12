// Run with: pnpm test
//
// Covers lib/shop/enquiry-input.ts, the rules shared by the product page
// enquiry form and its server action.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateEnquiry, enquiryPrompt, ENQUIRY_LIMITS } from '../lib/shop/enquiry-input.ts'

test('a complete enquiry is accepted and tidied', () => {
  const r = validateEnquiry({
    name: '  Ada   Lovelace ',
    email: ' Ada@Example.COM ',
    phone: '',
    message: '  Two copies, please.\nPosted to Gateshead.  ',
  })
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal(r.details.name, 'Ada Lovelace')
  assert.equal(r.details.email, 'ada@example.com')
  assert.equal(r.details.phone, null)
  assert.equal(r.details.message, 'Two copies, please.\nPosted to Gateshead.')
})

test('name, email and message are required', () => {
  const r = validateEnquiry({})
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.name)
  assert.ok(r.errors.email)
  assert.ok(r.errors.message)
  assert.equal(r.errors.phone, undefined)
})

test('a bad email and a bad phone number are caught', () => {
  const r = validateEnquiry({ name: 'A', email: 'not-an-email', phone: 'call me', message: 'Hi' })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.email)
  assert.ok(r.errors.phone)
})

test('an overlong message is refused, not truncated', () => {
  const r = validateEnquiry({ name: 'A', email: 'a@b.co', message: 'x'.repeat(ENQUIRY_LIMITS.message + 1) })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.ok(r.errors.message)
})

test('non-string values are treated as empty', () => {
  const r = validateEnquiry({ name: 42, email: ['a@b.co'], message: null })
  assert.equal(r.ok, false)
})

test('the prompt suits the product type and follows the house rules', () => {
  for (const t of ['book', 'other', 'print', 'original']) {
    const p = enquiryPrompt(t)
    assert.ok(p.length > 0)
    assert.ok(!p.includes('!'))
    assert.ok(!p.includes('—'))
  }
  assert.notEqual(enquiryPrompt('book'), enquiryPrompt('print'))
})
