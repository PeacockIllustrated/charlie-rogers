import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { canStoreOrders } from './orders'

// Shop settings an admin can change at /admin/settings: whether the checkout
// is open, UK postage, and where new order emails go. Stored in the single
// charlie_shop_settings row.
//
// Read through the service role, because the notification address is private
// and the table has no public policy. When there is no database to read
// (a preview without the service key, or before the migration is applied),
// the environment is the fallback: SHOP_CHECKOUT and SHOP_ORDER_NOTIFY_EMAIL.
// With neither, the checkout is closed, which is always the safe answer.

export type StoredCheckoutMode = 'closed' | 'manual' | 'stripe'

export interface ShopSettings {
  checkoutMode: StoredCheckoutMode
  ukPostagePence: number | null
  orderNotifyEmail: string | null
  // Where these came from, so the admin can say when the table is missing.
  source: 'database' | 'environment'
}

function fromEnvironment(): ShopSettings {
  const mode = process.env.SHOP_CHECKOUT?.trim().toLowerCase()
  return {
    checkoutMode: mode === 'manual' || mode === 'stripe' ? mode : 'closed',
    ukPostagePence: null,
    orderNotifyEmail: process.env.SHOP_ORDER_NOTIFY_EMAIL || null,
    source: 'environment',
  }
}

export async function getShopSettings(): Promise<ShopSettings> {
  if (!canStoreOrders()) return fromEnvironment()
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('charlie_shop_settings')
    .select('checkout_mode, uk_postage_pence, order_notify_email')
    .eq('id', true)
    .maybeSingle()
  if (error || !data) {
    if (error) console.error('[shop] settings query failed, using environment:', error.message)
    return fromEnvironment()
  }
  const row = data as { checkout_mode: StoredCheckoutMode; uk_postage_pence: number | null; order_notify_email: string | null }
  return {
    checkoutMode: row.checkout_mode,
    ukPostagePence: row.uk_postage_pence,
    orderNotifyEmail: row.order_notify_email,
    source: 'database',
  }
}
