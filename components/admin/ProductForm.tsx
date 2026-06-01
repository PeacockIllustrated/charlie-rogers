'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ImageUploader, type UploaderImage } from './ImageUploader'
import type { ProductType, ProductStatus } from '@/lib/shop/types'

export interface ProductFormInitial {
  id?: string
  title: string
  description: string
  price_gbp: string
  product_type: ProductType
  status: ProductStatus
  medium: string
  dimensions: string
  year_text: string
  edition: string
  stock_count: string
  is_featured: boolean
  images: UploaderImage[]
}

export const DEFAULT_PRODUCT_FORM: ProductFormInitial = {
  title: '',
  description: '',
  price_gbp: '',
  product_type: 'print',
  status: 'draft',
  medium: '',
  dimensions: '',
  year_text: '',
  edition: '',
  stock_count: '1',
  is_featured: false,
  images: [],
}

interface ProductFormProps {
  initial: ProductFormInitial
  mode: 'create' | 'edit'
}

export function ProductForm({ initial, mode }: ProductFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<'draft' | 'publish' | 'delete' | null>(null)

  function update<K extends keyof ProductFormInitial>(
    key: K,
    val: ProductFormInitial[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function submit(targetStatus: ProductStatus) {
    setError(null)
    setPending(targetStatus === 'published' ? 'publish' : 'draft')

    const price_pence = Math.round(parseFloat(form.price_gbp || '0') * 100)
    if (!form.title.trim()) {
      setError('Title is required')
      setPending(null)
      return
    }
    if (!Number.isFinite(price_pence) || price_pence < 0) {
      setError('Price must be a valid amount')
      setPending(null)
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price_pence,
      product_type: form.product_type,
      status: targetStatus,
      medium: form.medium || null,
      dimensions: form.dimensions || null,
      year_text: form.year_text || null,
      edition: form.edition || null,
      stock_count: parseInt(form.stock_count || '1', 10),
      is_featured: form.is_featured,
      images: form.images.map((img, i) => ({
        id: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text ?? null,
        display_order: i,
        is_primary: i === 0,
      })),
    }

    const url =
      mode === 'create' ? '/api/admin/products' : `/api/admin/products/${form.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Save failed')
        throw new Error(msg || 'Save failed')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setPending(null)
    }
  }

  async function archive() {
    if (!form.id) return
    if (!window.confirm('Archive this product? It will be hidden from the shop.'))
      return
    setPending('delete')
    try {
      const res = await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Archive failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Archive failed')
      setPending(null)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(form.status === 'published' ? 'published' : 'draft')
      }}
      className="space-y-8"
    >
      {error && (
        <div className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Details">
            <Field label="Title" htmlFor="title" required>
              <input
                id="title"
                className="input"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </Field>

            <Field label="Type" htmlFor="product_type">
              <select
                id="product_type"
                className="input"
                value={form.product_type}
                onChange={(e) => update('product_type', e.target.value as ProductType)}
              >
                <option value="book">Book</option>
                <option value="print">Fine art print</option>
                <option value="original">Original painting</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              help="Plain text. Line breaks are preserved."
            >
              <textarea
                id="description"
                className="input min-h-[10rem]"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
              />
            </Field>
          </Section>

          <Section title="Images">
            <ImageUploader
              value={form.images}
              onChange={(imgs) => update('images', imgs)}
              productId={form.id}
              max={6}
            />
          </Section>

          <Section title="Artwork details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Medium" htmlFor="medium" help="e.g. Giclée print, Pen and wash">
                <input
                  id="medium"
                  className="input"
                  value={form.medium}
                  onChange={(e) => update('medium', e.target.value)}
                />
              </Field>
              <Field label="Dimensions" htmlFor="dimensions" help="e.g. 40 x 30 cm, A4">
                <input
                  id="dimensions"
                  className="input"
                  value={form.dimensions}
                  onChange={(e) => update('dimensions', e.target.value)}
                />
              </Field>
              <Field label="Year" htmlFor="year_text" help="e.g. 1973, c. 1981">
                <input
                  id="year_text"
                  className="input"
                  value={form.year_text}
                  onChange={(e) => update('year_text', e.target.value)}
                />
              </Field>
              <Field label="Edition" htmlFor="edition" help="e.g. Edition of 50, Unique">
                <input
                  id="edition"
                  className="input"
                  value={form.edition}
                  onChange={(e) => update('edition', e.target.value)}
                />
              </Field>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Price and stock">
            <Field label="Price (£)" htmlFor="price_gbp" required>
              <input
                id="price_gbp"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price_gbp}
                onChange={(e) => update('price_gbp', e.target.value)}
                required
              />
            </Field>
            <Field
              label="Stock count"
              htmlFor="stock_count"
              help="Default 1 for originals."
            >
              <input
                id="stock_count"
                type="number"
                min="0"
                className="input"
                value={form.stock_count}
                onChange={(e) => update('stock_count', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Visibility">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => update('is_featured', e.target.checked)}
                className="mt-1"
              />
              <span className="font-sans text-small">
                <span className="block font-medium text-ink">Feature in the shop</span>
                <span className="font-sans text-xs text-ink-mute">
                  Shows first in the listing.
                </span>
              </span>
            </label>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-rule bg-paper px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void submit('draft')}
            disabled={pending !== null}
            className="btn-admin-outline"
          >
            {pending === 'draft' ? 'Saving' : 'Save as draft'}
          </button>
          <button
            type="button"
            onClick={() => void submit('published')}
            disabled={pending !== null}
            className="btn-admin"
          >
            {pending === 'publish' ? 'Publishing' : 'Publish'}
          </button>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={archive}
            disabled={pending !== null}
            className="font-sans text-small text-bensham hover:underline"
          >
            {pending === 'delete' ? 'Archiving' : 'Archive'}
          </button>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-paper p-5 md:p-6 space-y-4">
      <h2 className="font-serif text-h3">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  help,
  required,
  children,
}: {
  label: string
  htmlFor: string
  help?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="input-label">
        {label} {required && <span className="text-bensham">*</span>}
      </label>
      {children}
      {help && <p className="mt-1 font-sans text-xs text-ink-mute">{help}</p>}
    </div>
  )
}
