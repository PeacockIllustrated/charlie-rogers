import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateProductInput, validateImages } from '@/lib/shop/product-input'
import { replaceProductImages } from '@/lib/shop/product-images'

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin()
  if (authErr) return authErr

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = validateProductInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join('. ') }, { status: 400 })
  }

  // Checked before anything is written. A malformed entry used to throw inside
  // replaceProductImages, after the product row had already been inserted.
  const imgs = validateImages((body as { images?: unknown }).images)
  if (!imgs.ok) {
    return NextResponse.json({ error: imgs.error }, { status: 400 })
  }
  // On create there is nothing to preserve, so an absent array means none.
  const images = imgs.images ?? []

  const supabase = await createSupabaseServerClient()

  const { data: product, error: insertErr } = await supabase
    .from('charlie_products')
    .insert(parsed.value)
    .select('id, slug')
    .single()

  if (insertErr || !product) {
    // 23505 is a unique violation, which here can only be the slug. Postgres
    // phrases that as a constraint name, which means nothing to the person who
    // just typed a title that already exists.
    if (insertErr?.code === '23505') {
      return NextResponse.json(
        { error: `The web address "${parsed.value.slug}" is already used by another listing. Give this one a different slug.` },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: insertErr?.message ?? 'Insert failed' },
      { status: 500 },
    )
  }

  const imgErr = await replaceProductImages(supabase, product.id, images)
  if (imgErr) {
    // The product exists but its images did not save. Say so rather than
    // returning 200 and letting the listing look complete when it is not.
    return NextResponse.json(
      { error: `Listing saved, but its images failed: ${imgErr}`, id: product.id },
      { status: 500 },
    )
  }

  return NextResponse.json({ id: product.id, slug: product.slug })
}
