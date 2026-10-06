import { getCheckoutMode } from './payments'
import { canStoreOrders } from './orders'

// True when the checkout can actually take an order: a provider is chosen and
// orders have somewhere to be saved. Pages use this to decide whether to offer
// the checkout at all, so a customer is never walked through a form that
// cannot be submitted.
export function isCheckoutOpen(): boolean {
  return getCheckoutMode() !== 'closed' && canStoreOrders()
}
