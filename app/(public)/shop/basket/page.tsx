import type { Metadata } from 'next'
import { BackLink } from '@/components/BackLink'
import { BasketView } from '@/components/shop/BasketView'
import { isCheckoutOpen } from '@/lib/shop/checkout-open'

export const metadata: Metadata = {
  title: 'Basket',
  robots: { index: false, follow: false },
}

// Whether the checkout is open is read from the environment per request.
export const dynamic = 'force-dynamic'

export default async function BasketPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <BackLink href="/shop">The shop</BackLink>
      <h1 className="mt-6 font-serif text-h1">Basket</h1>
      <div className="mt-10">
        <BasketView checkoutOpen={await isCheckoutOpen()} />
      </div>
    </div>
  )
}
