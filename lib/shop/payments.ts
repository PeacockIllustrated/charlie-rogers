// How an order gets paid for. This is the one place Stripe plugs in.
//
// The checkout saves the order and reserves stock first (charlie_place_order),
// then hands the saved order to a PaymentProvider, which says where to send the
// customer next. Everything before that hand-off is provider agnostic.
//
// The checkout mode, set at /admin/settings (or SHOP_CHECKOUT as a fallback,
// see lib/shop/settings.ts), picks the provider:
//   'closed'           The checkout explains that ordering is not open yet and
//                      takes nothing. The default, so a deploy never starts
//                      taking orders by accident.
//   'manual'           Orders are taken and reserved, and no payment is
//                      collected online. Someone emails the customer to
//                      arrange payment, then marks the order paid in the admin.
//                      Useful for a soft launch, and for reviewing the flow.
//   'stripe'           Not built yet. See "Adding Stripe" in docs/SHOP.md. Until
//                      it is, this value is treated as closed, with a log line.

import { getShopSettings } from './settings'

export type CheckoutMode = 'closed' | 'manual'

export interface PlacedOrder {
  id: string
  orderNumber: string
  accessToken: string
  totalPence: number
}

export interface PaymentProvider {
  // Stored on the order as payment_provider.
  id: 'manual' | 'stripe'
  // Called once the order is saved. Returns the URL to send the customer to:
  // the confirmation page for manual, a Stripe Checkout session for Stripe.
  startPayment(order: PlacedOrder): Promise<{ redirectTo: string }>
}

export function confirmationPath(order: Pick<PlacedOrder, 'orderNumber' | 'accessToken'>): string {
  return `/shop/order/${encodeURIComponent(order.orderNumber)}?t=${encodeURIComponent(order.accessToken)}`
}

const manualProvider: PaymentProvider = {
  id: 'manual',
  async startPayment(order) {
    return { redirectTo: confirmationPath(order) }
  },
}

export async function getCheckoutMode(): Promise<CheckoutMode> {
  const { checkoutMode } = await getShopSettings()
  if (checkoutMode === 'manual') return 'manual'
  if (checkoutMode === 'stripe') {
    console.error('[shop] checkout mode is stripe but no Stripe provider is built yet; checkout is closed.')
  }
  return 'closed'
}

export async function getPaymentProvider(): Promise<PaymentProvider | null> {
  switch (await getCheckoutMode()) {
    case 'manual':
      return manualProvider
    case 'closed':
      return null
  }
}
