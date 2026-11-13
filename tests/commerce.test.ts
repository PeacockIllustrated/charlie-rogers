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
const original = product({ slug: 'original', title: 'An original', product_type: 'original', price_pence: 90000 })
const editions = (slug: string, limitedStock: number | null = 50) => [
  { id: `${slug}-s`, product_id: slug, code: 'standard', name: 'Standard print', detail: null, price_pence: 4500, stock_count: null, display_order: 0, is_active: true },
  { id: `${slug}-l`, product_id: slug, code: 'limited', name: 'Limited edition', detail: null, price_pence: 12000, stock_count: limitedStock, display_order: 1, is_active: true },
]
const pop = product({ slug: 'pop', title: 'Pop', product_type: 'print', price_pence: 4500, stock_count: 0, options: editions('pop') })

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

test('only priced, published books, cards and prints in stock can be bought', () => {
  assert.equal(purchasability(book).ok, true)
  assert.equal(purchasability(cards).ok, true)
  // A print with no editions has nothing to be sold at.
  assert.deepEqual(purchasability(print), { ok: false, reason: 'unpriced' })
  assert.deepEqual(purchasability(original), { ok: false, reason: 'not-for-sale-online' })
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
  assert.match(q.problems[0].message, /Town Moor is not priced yet/)
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

import { productWarnings } from '../lib/shop/product-input.ts'

test('productWarnings: stock and price matter only for what is ordered online', () => {
  const base = { status: 'published' as const, imageCount: 1, description: 'x' }
  assert.deepEqual(productWarnings({ ...base, product_type: 'print', price_pence: 0, stock_count: 0 }), [])
  assert.deepEqual(productWarnings({ ...base, product_type: 'book', price_pence: 0, stock_count: 0 }), [
    'No price, so it cannot be ordered online',
    'Sold out online: stock is zero',
  ])
  assert.deepEqual(productWarnings({ ...base, product_type: 'other', price_pence: 1000, stock_count: 5 }), [])
})

test('prints are bought in an edition, at the edition price, from its stock', () => {
  assert.equal(purchasability(pop).ok, true)
  assert.equal(purchasability(pop, 'limited').ok, true)
  assert.deepEqual(purchasability(pop, 'framed'), { ok: false, reason: 'unpublished' })
  assert.equal(maxQuantity(pop, 'standard'), MAX_LINE_QUANTITY)
  assert.equal(maxQuantity(product({ slug: 'p', product_type: 'print', options: editions('p', 3) }), 'limited'), 3)
  const soldOut = product({ slug: 'p', product_type: 'print', options: editions('p', 0) })
  assert.deepEqual(purchasability(soldOut, 'limited'), { ok: false, reason: 'sold-out' })
  assert.equal(purchasability(soldOut, 'standard').ok, true)
})

test('quoteBasket prices each edition as its own line, and prints post free', () => {
  const q = quoteBasket(
    [
      { slug: 'pop', option: 'limited', quantity: 1 },
      { slug: 'pop', option: 'standard', quantity: 2 },
    ],
    [pop],
    395,
  )
  assert.deepEqual(q.lines.map((l) => [l.key, l.unitPence, l.optionName]), [
    ['pop:limited', 12000, 'Limited edition'],
    ['pop:standard', 4500, 'Standard print'],
  ])
  assert.equal(q.subtotalPence, 21000)
  assert.equal(q.postagePence, 0)
  assert.equal(q.totalPence, 21000)
})

test('quoteBasket charges postage when anything other than a print is in the order', () => {
  const q = quoteBasket([{ slug: 'pop', option: 'limited', quantity: 1 }, { slug: 'cards', quantity: 1 }], [pop, cards], 395)
  assert.equal(q.postagePence, 395)
  assert.equal(quoteBasket([{ slug: 'cards', quantity: 1 }], [cards], null).postagePence, null)
})

test('quoteBasket removes a print with no edition chosen, and an edition that has gone', () => {
  const q = quoteBasket([{ slug: 'pop', quantity: 1 }, { slug: 'pop', option: 'framed', quantity: 1 }], [pop])
  assert.equal(q.lines.length, 0)
  assert.match(q.problems[0].message, /choose an edition of Pop/)
  assert.match(q.problems[1].message, /no longer listed/)
})

test('sanitiseBasket keeps editions apart and drops bad option codes', () => {
  assert.deepEqual(
    sanitiseBasket([
      { slug: 'pop', option: 'limited', quantity: 1 },
      { slug: 'pop', option: 'limited', quantity: 1 },
      { slug: 'pop', option: 'standard', quantity: 1 },
      { slug: 'pop', option: 'Bad Code', quantity: 1 },
    ]),
    [
      { slug: 'pop', option: 'limited', quantity: 2 },
      { slug: 'pop', option: 'standard', quantity: 1 },
    ],
  )
})
