import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server'
import { SHOP_BUCKET } from '@/lib/shop/utils'
import type { ProductType, ProductStatus } from '@/lib/shop/types'

interface ImagePayload {
  id?: string
  storage_path: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

interface UpdateBody {
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params

  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: existing, error: fetchErr } = await supabase
    .from('charlie_products')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error: updateErr } = await supabase
    .from('charlie_products')
    .update({
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
    .eq('id', id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Reconcile images: delete removed rows (with storage cleanup), upsert the rest.
  const { data: currentImgs } = await supabase
    .from('charlie_product_images')
    .select('id, storage_path')
    .eq('product_id', id)

  const incomingIds = new Set(
    body.images.map((i) => i.id).filter(Boolean) as string[],
  )
  const removed = (currentImgs ?? []).filter((row) => !incomingIds.has(row.id))

  if (removed.length > 0) {
    const ids = removed.map((r) => r.id)
    await supabase.from('charlie_product_images').delete().in('id', ids)
    const paths = removed.map((r) => r.storage_path)
    if (paths.length > 0) {
      await createSupabaseServiceClient().storage.from(SHOP_BUCKET).remove(paths)
    }
  }

  for (const img of body.images) {
    if (img.id) {
      await supabase
        .from('charlie_product_images')
        .update({
          alt_text: img.alt_text,
          display_order: img.display_order,
          is_primary: img.is_primary,
        })
        .eq('id', img.id)
    } else {
      await supabase.from('charlie_product_images').insert({
        product_id: id,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: img.is_primary,
      })
    }
  }

  return NextResponse.json({ id })
}

// Soft delete: set status to archived (hidden from the shop).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('charlie_products')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id })
}
