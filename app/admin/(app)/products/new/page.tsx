import Link from 'next/link'
import { ProductForm, DEFAULT_PRODUCT_FORM } from '@/components/admin/ProductForm'

export const metadata = { title: 'New product' }

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute hover:text-bensham"
        >
          Products
        </Link>
        <h1 className="mt-2 font-serif text-h1">New listing</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          Add a book, print, or original painting.
        </p>
      </div>
      <ProductForm mode="create" initial={DEFAULT_PRODUCT_FORM} />
    </div>
  )
}
