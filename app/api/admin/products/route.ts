import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ProductType, ProductStatus } from '@/lib/shop/types'

interface ImagePayload {
  id?: string
  storage_path: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

interface CreateBody {
  title: string
  description: string | null
  price_pence: number
  product_type: ProductType
  status: ProductStatus
  medium: string | null
  dimensions: string | null
  year_text: string | null
  edition: string | null
  stock_count: number
  is_featured: boolean
  images: ImagePayload[]
}

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }
  if (!Number.isFinite(body.price_pence) || body.price_pence < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: product, error: insertErr } = await supabase
    .from('charlie_products')
    .insert({
      title: body.title.trim(),
      description: body.description,
      price_pence: body.price_pence,
      product_type: body.product_type,
      status: body.status,
      medium: body.medium,
      dimensions: body.dimensions,
      year_text: body.year_text,
      edition: body.edition,
      stock_count: body.stock_count,
      is_featured: body.is_featured,
    })
    .select()
    .single()

  if (insertErr || !product) {
    return NextResponse.json(
      { error: insertErr?.message ?? 'Insert failed' },
      { status: 500 },
    )
  }

  if (body.images.length > 0) {
    const rows = body.images.map((img) => ({
      product_id: product.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      display_order: img.display_order,
      is_primary: img.is_primary,
    }))
    const { error: imgErr } = await supabase
      .from('charlie_product_images')
      .insert(rows)
    if (imgErr) {
      return NextResponse.json({ error: imgErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ id: product.id })
}
