// The print editions, as Brian Rankin set them out on 12 October 2026 with the
// Charlie Rogers Collection info sheet. Every print in the collection is
// offered at one size in two editions, delivered free. Kept in one place so
// the specification panel, the listings and the seed data agree.
//
// Since 13 November 2026 these are also the options a print is bought in
// (charlie_product_options in the database). The standard print is made to
// order by Paul Wright from his scans, so it has no stock limit; the limited
// edition is fifty of each painting, counted down as they sell.

export const PRINT_SIZE = '40.6 x 50.8 cm (16 x 20 in)'

export const PRINT_EDITIONS = [
  { code: 'standard', name: 'Standard print', detail: 'Giclée print', price_pence: 4500, stock_count: null },
  {
    code: 'limited',
    name: 'Limited edition',
    detail: 'Edition of 50, giclée, mounted, with a certificate of authenticity',
    price_pence: 12000,
    stock_count: 50,
  },
] as const

export const PRINT_FROM_PENCE = Math.min(...PRINT_EDITIONS.map((e) => e.price_pence))

export const PRINT_EDITION_TEXT = 'Standard print, or limited edition of 50'

export const PRINT_DELIVERY = 'Free delivery'

// Brian Rankin, 23 October 2026.
export const PRINT_STAMP = 'Each print is embossed with the Charlie Rogers blind stamp.'
