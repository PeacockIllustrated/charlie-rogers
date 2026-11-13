import type { ShopProduct, ShopProductOption } from './types'

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

// What sits in the browser. Only the slug, the option (a print's edition) and
// the quantity: titles and prices are always looked up afresh, so a stale
// basket cannot carry an old price.
export interface BasketLine {
  slug: string
  // Present only for products sold in options, such as prints.
  option?: string
  quantity: number
}

// One basket line per product and option.
export function lineKey(line: { slug: string; option?: string | null }): string {
  return line.option ? `${line.slug}:${line.option}` : line.slug
}

export type Purchasability =
  | { ok: true }
  | { ok: false; reason: 'unpriced' | 'not-for-sale-online' | 'unpublished' | 'sold-out' }

// The book, the cards and the prints are sold online. Prints became saleable
// on 13 November 2026: Paul Wright prints them from his own scans of the
// originals (Brian Rankin, 12 October 2026), so the low resolution files on
// this site are never what is printed, which was the reason CLAUDE.md held
// them back. Originals stay by enquiry: each is one of a kind and unpriced.
// charlie_place_order applies the same list; widen the two together.
export const SALEABLE_TYPES: ReadonlyArray<ShopProduct['product_type']> = ['book', 'other', 'print']

// Products sold in options must be bought as one of them.
export function activeOptions(product: ShopProduct): ShopProductOption[] {
  return (product.options ?? [])
    .filter((o) => o.is_active && o.price_pence > 0)
    .sort((a, b) => a.display_order - b.display_order)
}

function optionInStock(option: ShopProductOption): boolean {
  return option.stock_count === null || option.stock_count > 0
}

export function purchasability(product: ShopProduct, optionCode?: string): Purchasability {
  if (product.status !== 'published') return { ok: false, reason: 'unpublished' }
  if (!SALEABLE_TYPES.includes(product.product_type)) {
    return { ok: false, reason: 'not-for-sale-online' }
  }
  const options = activeOptions(product)
  if (options.length > 0) {
    if (optionCode === undefined) {
      return options.some(optionInStock) ? { ok: true } : { ok: false, reason: 'sold-out' }
    }
    const option = options.find((o) => o.code === optionCode)
    if (!option) return { ok: false, reason: 'unpublished' }
    return optionInStock(option) ? { ok: true } : { ok: false, reason: 'sold-out' }
  }
  // A print with no editions set up has nothing to sell it at.
  if (product.product_type === 'print') return { ok: false, reason: 'unpriced' }
  if (optionCode !== undefined) return { ok: false, reason: 'unpublished' }
  if (product.price_pence <= 0) return { ok: false, reason: 'unpriced' }
  if (product.stock_count <= 0) return { ok: false, reason: 'sold-out' }
  return { ok: true }
}

export function isPurchasable(product: ShopProduct): boolean {
  return purchasability(product).ok
}

// The most of one product, or one option of it, a single order may take.
export function maxQuantity(product: ShopProduct, optionCode?: string): number {
  const option = optionCode ? activeOptions(product).find((o) => o.code === optionCode) : undefined
  const stock = option ? option.stock_count : product.stock_count
  if (stock === null) return MAX_LINE_QUANTITY
  return Math.max(0, Math.min(MAX_LINE_QUANTITY, stock))
}

const SLUG = /^[a-z0-9-]{1,200}$/
const OPTION = /^[a-z0-9-]{1,40}$/

// Clean whatever came out of localStorage or a form field. Drops anything that
// is not a well formed line, merges duplicates of the same product and option,
// and clamps quantities to 1..MAX_LINE_QUANTITY. Never throws: a corrupt basket
// becomes an empty one.
export function sanitiseBasket(input: unknown): BasketLine[] {
  if (!Array.isArray(input)) return []
  const merged = new Map<string, BasketLine>()
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    const { slug, option, quantity } = raw as Record<string, unknown>
    if (typeof slug !== 'string' || !SLUG.test(slug)) continue
    if (option !== undefined && option !== null && (typeof option !== 'string' || !OPTION.test(option))) continue
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue
    const line: BasketLine = typeof option === 'string' ? { slug, option, quantity } : { slug, quantity }
    const key = lineKey(line)
    const prev = merged.get(key)
    merged.set(key, prev ? { ...line, quantity: prev.quantity + quantity } : line)
  }
  return [...merged.values()].map((l) => ({ ...l, quantity: Math.min(l.quantity, MAX_LINE_QUANTITY) }))
}

export interface QuotedLine {
  key: string
  slug: string
  option: string | null
  // The option's name, such as "Limited edition", for showing beside the title.
  optionName: string | null
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
  // 0 when everything is delivered free (prints only). Null when postage is
  // due but has not been set at /admin/settings: the basket then says it is
  // to be confirmed rather than showing a total that is not one.
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

// Prints are delivered free (Brian Rankin, 12 October 2026). Anything else in
// the order brings the UK postage set at /admin/settings.
export function postageFor(lines: Array<{ productType: ShopProduct['product_type'] }>, ukPostagePence: number | null): number | null {
  if (lines.length === 0) return null
  if (lines.every((l) => l.productType === 'print')) return 0
  return ukPostagePence
}

export function displayTitle(title: string, optionName: string | null | undefined): string {
  return optionName ? `${title}, ${optionName.toLowerCase()}` : title
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

  for (const line of sanitiseBasket(basket)) {
    const { slug, quantity } = line
    const product = bySlug.get(slug)
    if (!product) {
      problems.push({ slug, title: null, message: 'An item in your basket is no longer listed and has been removed.' })
      continue
    }
    const options = activeOptions(product)
    // A product that has gained options since it was added needs one chosen.
    if (options.length > 0 && !line.option) {
      problems.push({ slug, title: product.title, message: `Please choose an edition of ${product.title}; it has been removed from your basket.` })
      continue
    }
    const option = line.option ? options.find((o) => o.code === line.option) ?? null : null
    const label = displayTitle(product.title, option?.name)
    const check = purchasability(product, line.option)
    if (!check.ok) {
      problems.push({ slug, title: product.title, message: `${label} ${REASON_COPY[check.reason]}, and has been removed.` })
      continue
    }
    const max = maxQuantity(product, line.option)
    const qty = Math.min(quantity, max)
    if (qty < quantity) {
      problems.push({
        slug,
        title: product.title,
        message: `Only ${max} of ${label} can be ordered at once, so the quantity has been reduced.`,
      })
    }
    const primary =
      product.images?.find((i) => i.is_primary) ?? product.images?.[0] ?? null
    const unit = option ? option.price_pence : product.price_pence
    lines.push({
      key: lineKey(line),
      slug,
      option: option?.code ?? null,
      optionName: option?.name ?? null,
      title: product.title,
      productType: product.product_type,
      imagePath: primary?.storage_path ?? null,
      imageAlt: primary?.alt_text ?? null,
      unitPence: unit,
      quantity: qty,
      maxQuantity: max,
      lineTotalPence: unit * qty,
    })
  }

  const subtotalPence = lines.reduce((sum, l) => sum + l.lineTotalPence, 0)
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)
  const postage = postageFor(lines, postagePence)
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
  return quote.lines.map((l) =>
    l.option ? { slug: l.slug, option: l.option, quantity: l.quantity } : { slug: l.slug, quantity: l.quantity },
  )
}
