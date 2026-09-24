// One definition of what a valid product is, shared by the admin form and both
// API routes.
//
// It lived in three places before: the form checked title and price, POST
// checked title and price again in its own words, and PUT checked nothing at
// all, so a request that skipped the form could clear a title or set a negative
// price on an existing listing. Validation on the client is a courtesy to the
// person typing; the route is the only place it counts.

import type { ProductType, ProductStatus } from './types'

export interface ProductInput {
  title: string
  slug: string
  description: string | null
  price_pence: number
  product_type: ProductType
  status: ProductStatus
  medium: string | null
  dimensions: string | null
  year_text: string | null
  edition: string | null
  stock_count: number
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
}

export type ValidationResult =
  | { ok: true; value: ProductInput }
  | { ok: false; errors: string[] }

const PRODUCT_TYPES: ProductType[] = ['book', 'print', 'original', 'other']
const PRODUCT_STATUSES: ProductStatus[] = [
  'draft',
  'published',
  'sold',
  'archived',
]

// Matches the slug the database trigger would build, minus its random suffix.
// The trigger only fires when slug is null or empty, so sending one keeps the
// URL readable: it is the difference between /shop/town-moor-1966 and
// /shop/town-moor-1966-a3f9.
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Parse a price typed as pounds into integer pence.
//
// Kept away from cent-of-a-penny arithmetic on purpose: parseFloat('19.99') is
// 19.989999999999998, and multiplying before rounding is what turns a
// nineteen-ninety-nine listing into 1998 pence.
export function poundsToPence(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return 0
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [pounds, pence = ''] = trimmed.split('.')
  return Number(pounds) * 100 + Number(pence.padEnd(2, '0'))
}

export function penceToPounds(pence: number): string {
  return (pence / 100).toFixed(2)
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function nullable(value: unknown): string | null {
  const s = str(value)
  return s === '' ? null : s
}

// Accepts the raw shape sent by the form or an API client and either returns a
// value safe to write, or every reason it is not. Every reason, rather than the
// first: a form that reports one problem per submit teaches people to dread it.
export function validateProductInput(raw: unknown): ValidationResult {
  const errors: string[] = []
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errors: ['Request body must be an object'] }
  }
  const body = raw as Record<string, unknown>

  const title = str(body.title)
  if (title === '') errors.push('Title is required')
  if (title.length > 200) errors.push('Title must be 200 characters or fewer')

  // An empty slug is allowed and means "derive it from the title".
  const rawSlug = str(body.slug)
  const slug = rawSlug === '' ? slugify(title) : slugify(rawSlug)
  if (title !== '' && slug === '') {
    errors.push('Slug could not be derived from the title; enter one manually')
  }

  const price = body.price_pence
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    errors.push('Price must be a number')
  } else if (!Number.isInteger(price)) {
    errors.push('Price must be a whole number of pence')
  } else if (price < 0) {
    errors.push('Price cannot be negative')
  }

  const stock = body.stock_count
  if (typeof stock !== 'number' || !Number.isFinite(stock)) {
    // The form sent parseInt('') here, which is NaN, which JSON turns into null,
    // which the NOT NULL column rejected with a Postgres error rather than
    // anything a person could act on.
    errors.push('Stock count must be a number')
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.push('Stock count must be zero or a positive whole number')
  }

  const productType = str(body.product_type) as ProductType
  if (!PRODUCT_TYPES.includes(productType)) errors.push('Unknown product type')

  const status = str(body.status) as ProductStatus
  if (!PRODUCT_STATUSES.includes(status)) errors.push('Unknown status')

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      slug,
      description: nullable(body.description),
      price_pence: price as number,
      product_type: productType,
      status,
      medium: nullable(body.medium),
      dimensions: nullable(body.dimensions),
      year_text: nullable(body.year_text),
      edition: nullable(body.edition),
      stock_count: stock as number,
      is_featured: body.is_featured === true,
      meta_title: nullable(body.meta_title),
      meta_description: nullable(body.meta_description),
    },
  }
}

// Things worth saying out loud in the admin before a listing goes public.
// These are warnings, never blocks: the person running the shop knows more
// about their stock than a validator does.
export function productWarnings(p: {
  status: ProductStatus
  price_pence: number
  stock_count: number
  imageCount: number
  description: string | null
}): string[] {
  const out: string[] = []
  if (p.status === 'published') {
    if (p.imageCount === 0) out.push('Published with no image')
    if (p.price_pence === 0) out.push('Published at price on application')
    if (!p.description) out.push('Published with no description')
    if (p.stock_count === 0) out.push('Published but out of stock')
  }
  if (p.status === 'sold' && p.stock_count > 0) {
    out.push('Marked sold but stock remains')
  }
  return out
}
