// Run with: pnpm test
//
// Covers lib/shop/commerce.ts and lib/shop/checkout-input.ts: what can be put
// in a basket, what it costs, and what the checkout form accepts. The database
// function charlie_place_order applies the same sale rules again; these tests
// pin the half the customer sees.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  sanitiseBasket,
  quoteBasket,
  purchasability,
  maxQuantity,
  MAX_LINE_QUANTITY,
} from '../lib/shop/commerce.ts'
import { validateCheckoutDetails, normalisePostcode } from '../lib/shop/checkout-input.ts'
import type { ShopProduct } from '../lib/shop/types.ts'

function product(p: Partial<ShopProduct> & Pick<ShopProduct, 'slug'>): ShopProduct {
  return {
    id: p.slug,
    title: p.slug,
    description: null,
    price_pence: 2500,
    product_type: 'book',
    status: 'published',
    medium: null,
    dimensions: null,
    year_text: null,
    edition: null,
    stock_count: 100,
    is_featured: false,
    meta_title: null,
    meta_description: null,
    created_at: '',
    updated_at: '',
    images: [],
    ...p,
  }
}

const book = product({ slug: 'book', title: 'The special edition' })
const cards = product({ slug: 'cards', title: 'Greeting cards', product_type: 'other', price_pence: 1000 })
const print = product({ slug: 'print', title: 'Town Moor', product_type: 'print', price_pence: 4000 })

test('sanitiseBasket drops junk, merges duplicates and clamps', () => {
  assert.deepEqual(sanitiseBasket('nope'), [])
  assert.deepEqual(
    sanitiseBasket([
      { slug: 'book', quantity: 2 },
      { slug: 'book', quantity: 3 },
      { slug: 'cards', quantity: 0 },
      { slug: 'cards', quantity: 1.5 },
      { slug: 'Bad Slug', quantity: 1 },
      { slug: 'big', quantity: 999 },
      null,
    ]),
    [
      { slug: 'book', quantity: 5 },
      { slug: 'big', quantity: MAX_LINE_QUANTITY },
    ],
  )
})

test('only priced, published books and cards in stock can be bought', () => {
  assert.equal(purchasability(book).ok, true)
  assert.equal(purchasability(cards).ok, true)
  assert.deepEqual(purchasability(print), { ok: false, reason: 'not-for-sale-online' })
  assert.deepEqual(purchasability(product({ slug: 'x', price_pence: 0 })), { ok: false, reason: 'unpriced' })
  assert.deepEqual(purchasability(product({ slug: 'x', status: 'sold' })), { ok: false, reason: 'unpublished' })
  assert.deepEqual(purchasability(product({ slug: 'x', stock_count: 0 })), { ok: false, reason: 'sold-out' })
})

test('maxQuantity is the lower of stock and the per-line cap', () => {
  assert.equal(maxQuantity(product({ slug: 'x', stock_count: 3 })), 3)
  assert.equal(maxQuantity(book), MAX_LINE_QUANTITY)
})

test('quoteBasket prices from products, not from the basket', () => {
  const q = quoteBasket(
    [
      { slug: 'book', quantity: 2 },
      { slug: 'cards', quantity: 1 },
    ],
    [book, cards],
    null,
  )
  assert.equal(q.subtotalPence, 6000)
  assert.equal(q.itemCount, 3)
  assert.equal(q.postagePence, null)
  assert.equal(q.totalPence, 6000)
  assert.deepEqual(q.problems, [])
})

test('quoteBasket adds postage when it is set, and none to an empty basket', () => {
  assert.equal(quoteBasket([{ slug: 'book', quantity: 1 }], [book], 395).totalPence, 2895)
  assert.equal(quoteBasket([], [book], 395).postagePence, null)
})

test('quoteBasket removes what cannot be bought and says why', () => {
  const q = quoteBasket(
    [
      { slug: 'book', quantity: 1 },
      { slug: 'print', quantity: 1 },
      { slug: 'gone', quantity: 1 },
    ],
    [book, print],
  )
  assert.deepEqual(q.lines.map((l) => l.slug), ['book'])
  assert.equal(q.problems.length, 2)
  assert.match(q.problems[0].message, /Town Moor is by enquiry only/)
  assert.match(q.problems[1].message, /no longer listed/)
})

test('quoteBasket reduces a quantity above stock and reports it', () => {
  const q = quoteBasket([{ slug: 'book', quantity: 5 }], [product({ slug: 'book', title: 'Book', stock_count: 2 })])
  assert.equal(q.lines[0].quantity, 2)
  assert.equal(q.subtotalPence, 5000)
  assert.match(q.problems[0].message, /Only 2 of Book/)
})

const address = {
  name: '  Ann   Rogers ',
  email: 'Ann@Example.COM',
  phone: '',
  line1: '1 Cotfield Street',
  line2: '',
  town: 'Gateshead',
  county: '',
  postcode: 'ne8 4aa',
  notes: '',
}

test('validateCheckoutDetails tidies a good submission', () => {
  const r = validateCheckoutDetails(address)
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal(r.details.name, 'Ann Rogers')
  assert.equal(r.details.email, 'ann@example.com')
  assert.equal(r.details.phone, null)
  assert.equal(r.details.address.postcode, 'NE8 4AA')
  assert.equal(r.details.address.line2, null)
  assert.equal(r.details.address.country, 'United Kingdom')
})

test('validateCheckoutDetails names each missing or bad field', () => {
  const r = validateCheckoutDetails({ ...address, name: '', email: 'not an email', town: '', postcode: '75001' })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'postcode', 'town'])
  assert.match(r.errors.postcode ?? '', /UK postcode/)
})

test('validateCheckoutDetails caps lengths', () => {
  const r = validateCheckoutDetails({ ...address, notes: 'x'.repeat(1001) })
  assert.equal(r.ok, false)
})

test('normalisePostcode', () => {
  assert.equal(normalisePostcode('ne84aa'), 'NE8 4AA')
  assert.equal(normalisePostcode(' SW1A   1AA '), 'SW1A 1AA')
  assert.equal(normalisePostcode('bfpo 801'), 'BFPO 801')
})
