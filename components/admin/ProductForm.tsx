'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ImageUploader, type UploaderImage } from './ImageUploader'
import {
  slugify,
  poundsToPence,
  productWarnings,
} from '@/lib/shop/product-input'
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type ProductType,
  type ProductStatus,
} from '@/lib/shop/types'

export interface ProductFormInitial {
  id?: string
  title: string
  slug: string
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
  meta_title: string
  meta_description: string
  images: UploaderImage[]
}

export const DEFAULT_PRODUCT_FORM: ProductFormInitial = {
  title: '',
  slug: '',
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
  meta_title: '',
  meta_description: '',
  images: [],
}

const STATUS_HELP: Record<ProductStatus, string> = {
  draft: 'Only visible here. Nobody else can see it.',
  published: 'Live on the shop and readable by anyone.',
  sold: 'Still on the shop, shown as sold. Use this rather than archiving, so the record stays.',
  archived: 'Hidden from the shop. Nothing is deleted and it can be published again.',
}

const TYPES: ProductType[] = ['book', 'print', 'original', 'other']
const STATUSES: ProductStatus[] = ['draft', 'published', 'sold', 'archived']

export function ProductForm({
  initial,
  mode,
}: {
  initial: ProductFormInitial
  mode: 'create' | 'edit'
}) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // Once someone types a slug by hand, stop overwriting it from the title. On
  // an existing listing the slug is never auto-changed at all: it is a live URL
  // that may already be linked or shared.
  const slugTouched = useRef(mode === 'edit')

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  )

  // Losing a half-written listing to a stray click is the single most annoying
  // thing a small CMS can do.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const update = useCallback(
    <K extends keyof ProductFormInitial>(key: K, val: ProductFormInitial[K]) => {
      setForm((f) => ({ ...f, [key]: val }))
    },
    [],
  )

  function onTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched.current ? f.slug : slugify(value),
    }))
  }

  const pricePence = poundsToPence(form.price_gbp)
  const stockCount = Number.parseInt(form.stock_count, 10)

  const warnings = productWarnings({
    status: form.status,
    price_pence: pricePence ?? 0,
    stock_count: Number.isFinite(stockCount) ? stockCount : 0,
    imageCount: form.images.length,
    description: form.description.trim() || null,
  })

  async function save() {
    setErrors([])

    const local: string[] = []
    if (!form.title.trim()) local.push('Title is required')
    if (pricePence === null) {
      local.push('Price must be an amount in pounds, for example 25 or 19.99')
    }
    if (!Number.isFinite(stockCount) || stockCount < 0) {
      local.push('Stock count must be zero or a positive whole number')
    }
    if (local.length > 0) {
      setErrors(local)
      return
    }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price_pence: pricePence,
      product_type: form.product_type,
      status: form.status,
      medium: form.medium.trim() || null,
      dimensions: form.dimensions.trim() || null,
      year_text: form.year_text.trim() || null,
      edition: form.edition.trim() || null,
      stock_count: stockCount,
      is_featured: form.is_featured,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      images: form.images.map((img, i) => ({
        id: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text ?? null,
        display_order: i,
        is_primary: i === 0,
      })),
    }

    try {
      const res = await fetch(
        mode === 'create' ? '/api/admin/products' : `/api/admin/products/${form.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || `Save failed (${res.status})`)
      }
      // Reset the dirty check before navigating, or the guard fires on our own
      // redirect and asks the person whether they want to discard work we have
      // just saved.
      setForm((f) => ({ ...f }))
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed'])
      setSaving(false)
    }
  }

  async function archive() {
    if (!form.id) return
    if (
      !window.confirm(
        'Archive this listing? It is hidden from the shop but nothing is deleted, and you can publish it again later.',
      )
    ) {
      return
    }
    setArchiving(true)
    try {
      const res = await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Archive failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Archive failed'])
      setArchiving(false)
    }
  }

  const busy = saving || archiving

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className="space-y-8"
    >
      {errors.length > 0 && (
        <div
          role="alert"
          className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham"
        >
          {errors.length === 1 ? (
            errors[0]
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
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
                onChange={(e) => onTitleChange(e.target.value)}
                required
              />
            </Field>

            <Field
              label="Web address"
              htmlFor="slug"
              help={
                mode === 'edit'
                  ? 'Changing this breaks any existing link to the listing, so change it only if it is wrong.'
                  : 'Filled in from the title. Edit it if you want something shorter.'
              }
            >
              <div className="flex items-center gap-1 font-sans text-small">
                <span className="text-ink-mute">/shop/</span>
                <input
                  id="slug"
                  className="input flex-1"
                  value={form.slug}
                  onChange={(e) => {
                    slugTouched.current = true
                    update('slug', e.target.value)
                  }}
                  onBlur={(e) => update('slug', slugify(e.target.value))}
                />
              </div>
            </Field>

            <Field label="Type" htmlFor="product_type">
              <select
                id="product_type"
                className="input"
                value={form.product_type}
                onChange={(e) => update('product_type', e.target.value as ProductType)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PRODUCT_TYPE_LABELS[t]}
                  </option>
                ))}
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
              <Field label="Dimensions" htmlFor="dimensions" help="e.g. 40 x 30 cm, A3">
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

          <Section title="Search listing">
            <div className="space-y-4">
              <Field
                label="Page title"
                htmlFor="meta_title"
                help="Shown in search results and the browser tab. Falls back to the title."
              >
                <input
                  id="meta_title"
                  className="input"
                  value={form.meta_title}
                  onChange={(e) => update('meta_title', e.target.value)}
                  maxLength={70}
                />
              </Field>
              <Field
                label="Page description"
                htmlFor="meta_description"
                help="One or two sentences for search results. Around 155 characters."
              >
                <textarea
                  id="meta_description"
                  className="input"
                  rows={2}
                  value={form.meta_description}
                  onChange={(e) => update('meta_description', e.target.value)}
                  maxLength={200}
                />
              </Field>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Status">
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                className="input"
                value={form.status}
                onChange={(e) => update('status', e.target.value as ProductStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PRODUCT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <p className="font-sans text-xs text-ink-mute">{STATUS_HELP[form.status]}</p>

            {mode === 'edit' && form.status === 'published' && form.slug && (
              <a
                href={`/shop/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-sans text-small text-bensham underline underline-offset-4"
              >
                View on the shop
              </a>
            )}
          </Section>

          <Section title="Price and stock">
            <Field
              label="Price (£)"
              htmlFor="price_gbp"
              help="Leave blank or zero to show price on application."
            >
              <input
                id="price_gbp"
                type="text"
                inputMode="decimal"
                className="input"
                value={form.price_gbp}
                onChange={(e) => update('price_gbp', e.target.value)}
                aria-describedby="price_gbp-help"
              />
            </Field>
            {pricePence === 0 && (
              <p className="font-sans text-xs text-ochre">
                This will show as price on application.
              </p>
            )}
            <Field
              label="Stock count"
              htmlFor="stock_count"
              help="One for an original. Zero reads as out of stock."
            >
              <input
                id="stock_count"
                type="number"
                min="0"
                step="1"
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

          {warnings.length > 0 && (
            <div className="border border-ochre/40 bg-ochre/5 p-5">
              <h2 className="font-sans text-xs uppercase tracking-eyebrow text-ink-soft">
                Worth checking
              </h2>
              <ul className="mt-2 space-y-1 font-sans text-small text-ink-soft">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <p className="mt-2 font-sans text-xs text-ink-mute">
                These do not stop you saving.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-rule bg-paper px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button type="submit" disabled={busy} className="btn-admin">
            {saving ? 'Saving' : mode === 'create' ? 'Create listing' : 'Save changes'}
          </button>
          <Link href="/admin/products" className="font-sans text-small text-ink-soft hover:text-bensham">
            Cancel
          </Link>
          {dirty && !saving && (
            <span className="font-sans text-xs text-ink-mute">Unsaved changes</span>
          )}
        </div>
        {mode === 'edit' && form.status !== 'archived' && (
          <button
            type="button"
            onClick={archive}
            disabled={busy}
            className="font-sans text-small text-bensham hover:underline"
          >
            {archiving ? 'Archiving' : 'Archive'}
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
      {help && (
        <p id={`${htmlFor}-help`} className="mt-1 font-sans text-xs text-ink-mute">
          {help}
        </p>
      )}
    </div>
  )
}
