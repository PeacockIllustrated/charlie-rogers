import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type { CheckoutDetails } from './checkout-input'
import type { BasketLine } from './commerce'
import type { PlacedOrder, PaymentProvider } from './payments'
import type { ProductType } from './types'

// Orders are written and read through the service role only. The tables have
// no public policy (see 20261006150000_charlie-shop-orders.sql), so this file
// is the single path between a customer and their order. Never import it from
// a Client Component.

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  shipped: 'Posted',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export interface OrderItem {
  product_slug: string
  product_title: string
  product_type: ProductType
  quantity: number
  unit_price_pence: number
  line_total_pence: number
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: CheckoutDetails['address']
  notes: string | null
  subtotal_pence: number
  postage_pence: number | null
  total_pence: number
  payment_provider: string
  created_at: string
  items: OrderItem[]
}

// Orders need the service role key, which is server only and may not be set
// on a preview. Checked up front so the checkout can say so plainly.
export function canStoreOrders(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export type PlaceOrderFailure =
  | { kind: 'unavailable'; slug: string }
  | { kind: 'stock'; slug: string }
  | { kind: 'price_changed' }
  | { kind: 'empty' }
  | { kind: 'error' }

// Turn the stable prefixes raised by charlie_place_order into something the
// checkout can act on. Anything else is a fault, logged in full.
export function parsePlaceOrderError(message: string): PlaceOrderFailure {
  const m = /charlie_order:(\w+)(?::([a-z0-9-]+))?/.exec(message)
  switch (m?.[1]) {
    case 'unavailable':
      return { kind: 'unavailable', slug: m[2] ?? '' }
    case 'stock':
      return { kind: 'stock', slug: m[2] ?? '' }
    case 'price_changed':
      return { kind: 'price_changed' }
    case 'empty':
      return { kind: 'empty' }
    default:
      return { kind: 'error' }
  }
}

export async function placeOrder(input: {
  details: CheckoutDetails
  basket: BasketLine[]
  postagePence: number | null
  expectedSubtotalPence: number
  provider: PaymentProvider['id']
}): Promise<{ ok: true; order: PlacedOrder } | { ok: false; failure: PlaceOrderFailure }> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.rpc('charlie_place_order', {
    p_customer_name: input.details.name,
    p_customer_email: input.details.email,
    p_customer_phone: input.details.phone,
    p_shipping_address: input.details.address,
    p_notes: input.details.notes,
    p_items: input.basket,
    p_postage_pence: input.postagePence,
    p_expected_subtotal_pence: input.expectedSubtotalPence,
    p_payment_provider: input.provider,
  })

  if (error) {
    const failure = parsePlaceOrderError(error.message)
    if (failure.kind === 'error') console.error('[shop] placing order failed:', error.message)
    return { ok: false, failure }
  }

  const row = (data as Array<{ order_id: string; order_number: string; access_token: string; total_pence: number }> | null)?.[0]
  if (!row) {
    console.error('[shop] placing order returned no row')
    return { ok: false, failure: { kind: 'error' } }
  }
  return {
    ok: true,
    order: {
      id: row.order_id,
      orderNumber: row.order_number,
      accessToken: row.access_token,
      totalPence: row.total_pence,
    },
  }
}

const ORDER_COLUMNS =
  'id, order_number, status, customer_name, customer_email, customer_phone, shipping_address, notes, subtotal_pence, postage_pence, total_pence, payment_provider, created_at, items:charlie_order_items(product_slug, product_title, product_type, quantity, unit_price_pence, line_total_pence)'

// The customer's own view of an order. Both the number and the token must
// match; a wrong token is indistinguishable from a missing order.
export async function fetchOrderForCustomer(orderNumber: string, token: string): Promise<Order | null> {
  if (!canStoreOrders() || !/^CR-\d{4}-\d{4,}$/.test(orderNumber) || !/^[a-f0-9]{64}$/.test(token)) {
    return null
  }
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('charlie_orders')
    .select(ORDER_COLUMNS)
    .eq('order_number', orderNumber)
    .eq('access_token', token)
    .maybeSingle()
  if (error) {
    console.error(`[shop] order lookup failed for ${orderNumber}:`, error.message)
    return null
  }
  return (data as Order | null) ?? null
}

export { ORDER_COLUMNS }
