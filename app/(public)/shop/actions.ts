'use server'

import { redirect } from 'next/navigation'
import { quoteBasket, sanitiseBasket, basketFromQuote, type Quote } from '@/lib/shop/commerce'
import { validateCheckoutDetails, type CheckoutErrors } from '@/lib/shop/checkout-input'
import { fetchProductsBySlugs } from '@/lib/shop/products'
import { canStoreOrders, placeOrder } from '@/lib/shop/orders'
import { getPaymentProvider } from '@/lib/shop/payments'
import { notifyShopOfOrder } from '@/lib/shop/notify'
import { getShopSettings } from '@/lib/shop/settings'

// Price whatever the browser holds. Called by the basket and the checkout so
// what the customer sees always comes from the server, never from storage.
export async function quoteBasketAction(raw: unknown): Promise<Quote> {
  const basket = sanitiseBasket(raw)
  const [products, settings] = await Promise.all([
    fetchProductsBySlugs(basket.map((l) => l.slug)),
    getShopSettings(),
  ])
  return quoteBasket(basket, products, settings.ukPostagePence)
}

export interface CheckoutState {
  errors?: CheckoutErrors
  // A sentence for the top of the form, when the problem is not one field.
  message?: string
  // The basket changed under the customer: their stored basket should be
  // replaced with this, and they should look again before resubmitting.
  revisedBasket?: Array<{ slug: string; quantity: number }>
  // Echoed back so a failed submission does not empty the form.
  values?: Record<string, string>
}

const FIELDS = ['name', 'email', 'phone', 'line1', 'line2', 'town', 'county', 'postcode', 'notes'] as const

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const values: Record<string, string> = {}
  for (const f of FIELDS) {
    const v = formData.get(f)
    values[f] = typeof v === 'string' ? v : ''
  }

  const settings = await getShopSettings()
  const provider = await getPaymentProvider()
  if (!provider) {
    return { values, message: 'Online ordering is not open yet. Nothing has been taken.' }
  }
  if (!canStoreOrders()) {
    console.error('[shop] checkout is open but SUPABASE_SERVICE_ROLE_KEY is not set')
    return { values, message: 'Orders cannot be taken on this version of the site. Nothing has been taken.' }
  }

  const checked = validateCheckoutDetails(values)
  if (!checked.ok) {
    return { values, errors: checked.errors, message: 'Please check the highlighted details.' }
  }

  let rawBasket: unknown = []
  try {
    rawBasket = JSON.parse(String(formData.get('basket') ?? '[]'))
  } catch {
    rawBasket = []
  }
  const submitted = sanitiseBasket(rawBasket)
  const products = await fetchProductsBySlugs(submitted.map((l) => l.slug))
  const quote = quoteBasket(submitted, products, settings.ukPostagePence)

  if (quote.lines.length === 0) {
    return { values, message: 'Your basket is empty.', revisedBasket: [] }
  }
  if (quote.problems.length > 0) {
    return {
      values,
      message: `${quote.problems.map((p) => p.message).join(' ')} Please check your order and place it again.`,
      revisedBasket: basketFromQuote(quote),
    }
  }

  const result = await placeOrder({
    details: checked.details,
    basket: basketFromQuote(quote),
    postagePence: quote.postagePence,
    expectedSubtotalPence: quote.subtotalPence,
    provider: provider.id,
  })

  if (!result.ok) {
    const { failure } = result
    const title = (slug: string) => quote.lines.find((l) => l.slug === slug)?.title ?? 'An item'
    switch (failure.kind) {
      case 'stock':
        return { values, message: `${title(failure.slug)} has just sold out or has too few left. Please check your basket.`, revisedBasket: basketFromQuote(quote) }
      case 'unavailable':
        return { values, message: `${title(failure.slug)} can no longer be ordered online. Please check your basket.`, revisedBasket: basketFromQuote(quote).filter((l) => l.slug !== failure.slug) }
      case 'price_changed':
        return { values, message: 'A price changed while you were ordering. Please check the new total and place the order again.', revisedBasket: basketFromQuote(quote) }
      case 'empty':
        return { values, message: 'Your basket is empty.', revisedBasket: [] }
      case 'error':
        return { values, message: 'Something went wrong and the order was not placed. Nothing has been taken. Please try again.' }
    }
  }

  // Only the manual provider is told about here. A card payment provider
  // notifies from its webhook, once the money has actually arrived.
  if (provider.id === 'manual') await notifyShopOfOrder(settings.orderNotifyEmail, result.order, checked.details, quote)

  const { redirectTo } = await provider.startPayment(result.order)
  // Outside any try block: redirect() works by throwing.
  redirect(redirectTo)
}
