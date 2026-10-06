import type { ShopProduct } from './types'

// The rules for what can go in a basket and what it costs. Pure, so the basket
// page, the checkout and the tests all agree, and so it runs under
// node --experimental-strip-types without Next or Supabase.
//
// The database function charlie_place_order applies the same rules again when
// an order is placed. This file decides what the customer is shown; the
// database decides what is sold.

// A sensible ceiling for one line. Stock is the real limit; this stops a typo
// of 100 copies reaching the order form.
export const MAX_LINE_QUANTITY = 10

// What sits in the browser. Only the slug and the quantity: titles and prices
// are always looked up afresh, so a stale basket cannot carry an old price.
export interface BasketLine {
  slug: string
  quantity: number
}

export type Purchasability =
  | { ok: true }
  | { ok: false; reason: 'unpriced' | 'not-for-sale-online' | 'unpublished' | 'sold-out' }

// Only the book and the card pack are sold online. Prints and originals stay
// by enquiry: the files we hold are around 108ppi, nowhere near print quality,
// and CLAUDE.md rules out a print purchase flow against them. When high
// resolution scans arrive, widen this and the matching test in
// charlie_place_order together.
const SALEABLE_TYPES: ReadonlyArray<ShopProduct['product_type']> = ['book', 'other']

export function purchasability(product: ShopProduct): Purchasability {
  if (product.status !== 'published') return { ok: false, reason: 'unpublished' }
  if (!SALEABLE_TYPES.includes(product.product_type)) {
    return { ok: false, reason: 'not-for-sale-online' }
  }
  if (product.price_pence <= 0) return { ok: false, reason: 'unpriced' }
  if (product.stock_count <= 0) return { ok: false, reason: 'sold-out' }
  return { ok: true }
}

export function isPurchasable(product: ShopProduct): boolean {
  return purchasability(product).ok
}

// The most of one product a single order may take.
export function maxQuantity(product: ShopProduct): number {
  return Math.max(0, Math.min(MAX_LINE_QUANTITY, product.stock_count))
}

// Clean whatever came out of localStorage or a form field. Drops anything that
// is not a well formed line, merges duplicate slugs, and clamps quantities to
// 1..MAX_LINE_QUANTITY. Never throws: a corrupt basket becomes an empty one.
export function sanitiseBasket(input: unknown): BasketLine[] {
  if (!Array.isArray(input)) return []
  const merged = new Map<string, number>()
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    const { slug, quantity } = raw as Record<string, unknown>
    if (typeof slug !== 'string' || !/^[a-z0-9-]{1,200}$/.test(slug)) continue
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue
    merged.set(slug, (merged.get(slug) ?? 0) + quantity)
  }
  return [...merged].map(([slug, quantity]) => ({
    slug,
    quantity: Math.min(quantity, MAX_LINE_QUANTITY),
  }))
}

export interface QuotedLine {
  slug: string
  title: string
  productType: ShopProduct['product_type']
  imagePath: string | null
  imageAlt: string | null
  unitPence: number
  quantity: number
  maxQuantity: number
  lineTotalPence: number
}

export interface BasketProblem {
  slug: string
  title: string | null
  message: string
}

export interface Quote {
  lines: QuotedLine[]
  problems: BasketProblem[]
  itemCount: number
  subtotalPence: number
  // Null when postage has not been set at /admin/settings. Brian Rankin has
  // not stated it, so the basket says it is to be confirmed rather than
  // showing a total that is not one.
  postagePence: number | null
  // Subtotal plus postage, or the subtotal alone when postage is unknown.
  totalPence: number
}

const REASON_COPY: Record<Exclude<Purchasability, { ok: true }>['reason'], string> = {
  unpriced: 'is not priced yet, so it is by enquiry only',
  'not-for-sale-online': 'is by enquiry only',
  unpublished: 'is no longer listed',
  'sold-out': 'has sold out',
}

// Price a basket against the current products. Lines that can no longer be
// bought are moved to `problems` with a sentence to show the customer, rather
// than silently vanishing. Quantities above what is left are reduced, and that
// is reported too.
export function quoteBasket(
  basket: BasketLine[],
  products: ShopProduct[],
  postagePence: number | null = null,
): Quote {
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  const lines: QuotedLine[] = []
  const problems: BasketProblem[] = []

  for (const { slug, quantity } of sanitiseBasket(basket)) {
    const product = bySlug.get(slug)
    if (!product) {
      problems.push({ slug, title: null, message: 'An item in your basket is no longer listed and has been removed.' })
      continue
    }
    const check = purchasability(product)
    if (!check.ok) {
      problems.push({ slug, title: product.title, message: `${product.title} ${REASON_COPY[check.reason]}, and has been removed.` })
      continue
    }
    const max = maxQuantity(product)
    const qty = Math.min(quantity, max)
    if (qty < quantity) {
      problems.push({
        slug,
        title: product.title,
        message: `Only ${max} of ${product.title} can be ordered at once, so the quantity has been reduced.`,
      })
    }
    const primary =
      product.images?.find((i) => i.is_primary) ?? product.images?.[0] ?? null
    lines.push({
      slug,
      title: product.title,
      productType: product.product_type,
      imagePath: primary?.storage_path ?? null,
      imageAlt: primary?.alt_text ?? null,
      unitPence: product.price_pence,
      quantity: qty,
      maxQuantity: max,
      lineTotalPence: product.price_pence * qty,
    })
  }

  const subtotalPence = lines.reduce((sum, l) => sum + l.lineTotalPence, 0)
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)
  const postage = lines.length > 0 ? postagePence : null
  return {
    lines,
    problems,
    itemCount,
    subtotalPence,
    postagePence: postage,
    totalPence: subtotalPence + (postage ?? 0),
  }
}

// The basket as it should be stored after a quote: the lines that survived,
// at the quantities that were allowed.
export function basketFromQuote(quote: Quote): BasketLine[] {
  return quote.lines.map((l) => ({ slug: l.slug, quantity: l.quantity }))
}
