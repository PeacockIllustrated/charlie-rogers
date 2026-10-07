import type { Metadata } from 'next'
import { BackLink } from '@/components/BackLink'
import { Button } from '@/components/Button'
import { CheckoutForm } from '@/components/shop/CheckoutForm'
import { isCheckoutOpen } from '@/lib/shop/checkout-open'
import { getPaymentProvider } from '@/lib/shop/payments'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// What the customer is told about paying, and what the button says, by
// provider. When Stripe is added it gets its own entry here; nothing else on
// the page needs to change.
const COPY = {
  manual: {
    note: 'No payment is taken online. Placing the order reserves your copies, and we will email you to arrange payment and confirm postage before anything is sent.',
    submit: 'Place order',
  },
  stripe: {
    note: 'You will be taken to Stripe to pay securely by card.',
    submit: 'Continue to payment',
  },
} as const

export default async function CheckoutPage() {
  const [provider, open] = await Promise.all([getPaymentProvider(), isCheckoutOpen()])

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <BackLink href="/shop/basket">Basket</BackLink>
      <h1 className="mt-6 font-serif text-h1">Checkout</h1>
      <div className="mt-10">
        {provider && open ? (
          <CheckoutForm paymentNote={COPY[provider.id].note} submitLabel={COPY[provider.id].submit} />
        ) : (
          <div className="max-w-reading border border-rule bg-paper-warm p-6 sm:p-8">
            <h2 className="font-serif text-h3">Online ordering is not open yet</h2>
            <p className="mt-3 font-serif text-body text-ink-soft">
              Your basket is kept in this browser in the meantime. The book and
              the cards can still be asked about from their pages in the shop.
            </p>
            <div className="mt-8">
              <Button href="/shop">Back to the shop</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
