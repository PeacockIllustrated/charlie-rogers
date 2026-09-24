import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateProductInput } from '@/lib/shop/product-input'
import { replaceProductImages, type ImagePayload } from '@/lib/shop/product-images'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // PUT used to write whatever it was given. A request that did not come from
  // the form could clear a title or set a negative price on a live listing,
  // because only POST checked anything.
  const parsed = validateProductInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join('. ') }, { status: 400 })
  }

  const images = Array.isArray((body as { images?: unknown }).images)
    ? ((body as { images: ImagePayload[] }).images)
    : []

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
    .update(parsed.value)
    .eq('id', id)

  if (updateErr) {
    if (updateErr.code === '23505') {
      return NextResponse.json(
        { error: `The web address "${parsed.value.slug}" is already used by another listing. Give this one a different slug.` },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  const imgErr = await replaceProductImages(supabase, id, images)
  if (imgErr) {
    return NextResponse.json(
      { error: `Listing saved, but its images failed: ${imgErr}`, id },
      { status: 500 },
    )
  }

  return NextResponse.json({ id, slug: parsed.value.slug })
}

// Soft delete: archive rather than remove, so a listing can be brought back and
// so nothing that once had a public URL disappears without trace.
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
