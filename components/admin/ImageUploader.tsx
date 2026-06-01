'use client'

import { useRef, useState } from 'react'
import { cn, shopImageUrl } from '@/lib/shop/utils'

export interface UploaderImage {
  id?: string
  storage_path: string
  alt_text?: string | null
  display_order: number
  is_primary: boolean
}

interface ImageUploaderProps {
  value: UploaderImage[]
  onChange: (next: UploaderImage[]) => void
  productId?: string
  max?: number
}

// Drag-to-upload, reorder, delete. First image is primary. Uploads POST to
// /api/admin/upload, which stores to the charlie-shop-images bucket.
export function ImageUploader({
  value,
  onChange,
  productId,
  max = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const remaining = Math.max(0, max - value.length)

  function normaliseOrder(list: UploaderImage[]): UploaderImage[] {
    return list.map((img, i) => ({
      ...img,
      display_order: i,
      is_primary: i === 0,
    }))
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!files || !('length' in files) || !files.length) return
    setError(null)
    setUploading(true)

    const toUpload = Array.from(files).slice(0, remaining)
    const uploaded: UploaderImage[] = []

    try {
      for (const file of toUpload) {
        const form = new FormData()
        form.append('file', file)
        if (productId) form.append('productId', productId)

        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        if (!res.ok) {
          const msg = await res.text().catch(() => 'Upload failed')
          throw new Error(msg || 'Upload failed')
        }
        const body = (await res.json()) as { storage_path: string }
        uploaded.push({
          storage_path: body.storage_path,
          alt_text: null,
          display_order: value.length + uploaded.length,
          is_primary: value.length + uploaded.length === 0,
        })
      }
      onChange(normaliseOrder([...value, ...uploaded]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(index: number) {
    onChange(normaliseOrder(value.filter((_, i) => i !== index)))
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(normaliseOrder(next))
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length && remaining > 0) {
            void uploadFiles(e.dataTransfer.files)
          }
        }}
        className={cn(
          'border-2 border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-ochre bg-ochre/5' : 'border-rule bg-paper-warm/50',
          remaining === 0 && 'opacity-60',
        )}
      >
        <p className="font-sans text-small text-ink">
          {remaining === 0 ? `Maximum ${max} images reached` : 'Drop images here, or'}
        </p>
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 font-sans text-small font-medium text-bensham hover:text-bensham-deep"
          >
            click to select
          </button>
        )}
        <p className="mt-1 font-sans text-xs text-ink-mute">
          JPG, PNG or WebP, up to {max} images, first image becomes primary.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
        />
        {uploading && (
          <p className="mt-3 font-sans text-xs text-ink-mute">Uploading</p>
        )}
        {error && <p className="mt-3 font-sans text-xs text-bensham">{error}</p>}
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {value.map((img, i) => {
            const url = shopImageUrl(img.storage_path)
            return (
              <li
                key={`${img.storage_path}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, i)
                  setDragIndex(null)
                }}
                className={cn(
                  'group relative aspect-square overflow-hidden border border-rule bg-paper-warm',
                  dragIndex === i && 'opacity-50',
                )}
              >
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
                {img.is_primary && (
                  <span className="absolute left-1 top-1 bg-bensham px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-eyebrow text-paper">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 flex flex-col justify-between bg-ink/40 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      className="bg-paper/90 px-1.5 font-sans text-xs text-ink disabled:opacity-30"
                      aria-label="Move left"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      disabled={i === value.length - 1}
                      className="bg-paper/90 px-1.5 font-sans text-xs text-ink disabled:opacity-30"
                      aria-label="Move right"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="bg-paper/90 px-2 py-0.5 font-sans text-[10px] uppercase tracking-eyebrow text-bensham"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
