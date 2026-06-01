import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { SHOP_BUCKET } from '@/lib/shop/utils'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  const form = await request.formData()
  const file = form.get('file')
  const productId = (form.get('productId') as string | null) || 'unassigned'

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 })
  }

  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : file.type === 'image/avif'
          ? 'avif'
          : 'jpg'
  const safeProductId = productId.replace(/[^a-zA-Z0-9-]/g, '')
  const path = `products/${safeProductId}/${randomUUID()}.${ext}`

  const supabase = createSupabaseServiceClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await supabase.storage
    .from(SHOP_BUCKET)
    .upload(path, buffer, { contentType: file.type, cacheControl: '3600' })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  return NextResponse.json({ storage_path: path })
}
