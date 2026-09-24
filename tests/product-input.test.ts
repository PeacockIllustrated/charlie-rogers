// Run with: pnpm test
//
// These cover lib/shop/product-input.ts, which is deliberately pure so it can
// be tested without Supabase, a browser or a running server. The admin form and
// both API routes all go through it, so a bug here is a bug everywhere.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  slugify,
  poundsToPence,
  penceToPounds,
  validateProductInput,
  productWarnings,
} from '../lib/shop/product-input.ts'

const valid = {
  title: 'Town Moor, Newcastle-upon-Tyne',
  slug: '',
  description: 'A day at the Hoppings.',
  price_pence: 2500,
  product_type: 'print',
  status: 'published',
  medium: 'Watercolour',
  dimensions: 'A3',
  year_text: '1966',
  edition: null,
  stock_count: 1,
  is_featured: true,
  meta_title: null,
  meta_description: null,
}

test('slugify produces readable, url safe slugs', () => {
  assert.equal(slugify('Town Moor, Newcastle-upon-Tyne'), 'town-moor-newcastle-upon-tyne')
  assert.equal(slugify("Pot Pie Bob's"), 'pot-pie-bobs')
  assert.equal(slugify('  Bigg   Market  '), 'bigg-market')
  assert.equal(slugify('Café & Bar'), 'cafe-bar')
  assert.equal(slugify('---'), '')
})

test('poundsToPence never loses a penny to floating point', () => {
  // The obvious implementation, Math.round(parseFloat(v) * 100), gets 19.99
  // right by luck and other values wrong. Check the awkward ones explicitly.
  assert.equal(poundsToPence('19.99'), 1999)
  assert.equal(poundsToPence('0.07'), 7)
  assert.equal(poundsToPence('1.10'), 110)
  assert.equal(poundsToPence('1.1'), 110)
  assert.equal(poundsToPence('25'), 2500)
  assert.equal(poundsToPence(''), 0, 'blank means unpriced, not invalid')
  assert.equal(poundsToPence('abc'), null)
  assert.equal(poundsToPence('-5'), null)
  assert.equal(poundsToPence('1.999'), null, 'more precision than a penny')
})

test('penceToPounds round trips', () => {
  for (const pence of [0, 7, 110, 1999, 2500, 123456]) {
    assert.equal(poundsToPence(penceToPounds(pence)), pence)
  }
})

test('a good payload validates and is normalised', () => {
  const res = validateProductInput(valid)
  assert.equal(res.ok, true)
  if (!res.ok) return
  assert.equal(res.value.slug, 'town-moor-newcastle-upon-tyne', 'slug derived from title')
  assert.equal(res.value.edition, null)
  assert.equal(res.value.is_featured, true)
})

test('an explicit slug is kept, but normalised', () => {
  const res = validateProductInput({ ...valid, slug: '  Town Moor 1966!! ' })
  assert.equal(res.ok, true)
  if (!res.ok) return
  assert.equal(res.value.slug, 'town-moor-1966')
})

test('every problem is reported at once, not one per submit', () => {
  const res = validateProductInput({
    ...valid,
    title: '',
    price_pence: -1,
    stock_count: 1.5,
    product_type: 'sculpture',
    status: 'live',
  })
  assert.equal(res.ok, false)
  if (res.ok) return
  assert.ok(res.errors.length >= 5, `expected several errors, got ${res.errors.length}`)
})

test('NaN stock is rejected rather than reaching the database as null', () => {
  // This is the exact value the old form produced from an emptied stock field:
  // parseInt('') is NaN, and JSON.stringify turns NaN into null, which the
  // NOT NULL column rejected with a Postgres error instead of a usable message.
  const res = validateProductInput({ ...valid, stock_count: Number.NaN })
  assert.equal(res.ok, false)
  if (res.ok) return
  assert.ok(res.errors.some((e) => e.includes('Stock count')))
})

test('a non integer price is rejected', () => {
  const res = validateProductInput({ ...valid, price_pence: 19.99 })
  assert.equal(res.ok, false)
})

test('price of zero is allowed: it means price on application', () => {
  const res = validateProductInput({ ...valid, price_pence: 0 })
  assert.equal(res.ok, true)
})

test('every status is accepted, including sold and archived', () => {
  for (const status of ['draft', 'published', 'sold', 'archived']) {
    const res = validateProductInput({ ...valid, status })
    assert.equal(res.ok, true, `${status} should be a valid status`)
  }
})

test('rubbish bodies do not throw', () => {
  for (const body of [null, undefined, 'a string', 42, []]) {
    const res = validateProductInput(body)
    assert.equal(res.ok, false)
  }
})

test('warnings fire only where they are useful', () => {
  assert.deepEqual(
    productWarnings({ status: 'draft', price_pence: 0, stock_count: 0, imageCount: 0, description: null }),
    [],
    'a draft is work in progress, not a problem',
  )
  const published = productWarnings({
    status: 'published', price_pence: 0, stock_count: 0, imageCount: 0, description: null,
  })
  assert.equal(published.length, 4)
  assert.deepEqual(
    productWarnings({ status: 'sold', price_pence: 2500, stock_count: 3, imageCount: 1, description: 'x' }),
    ['Marked sold but stock remains'],
  )
})
