'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { poundsToPence } from '@/lib/shop/product-input'
import { PRINT_EDITIONS } from '@/lib/shop/prints'

// The editions a print is sold in (charlie_product_options). Run as the
// signed-in admin, so the row level security policy is what decides;
// requireAdmin() is the polite early exit.

const UUID = /^[0-9a-f-]{36}$/

function back(productId: string, message?: string): never {
  const qs = message ? `?error=${encodeURIComponent(message)}` : ''
  redirect(`/admin/products/${productId}/edit${qs}#editions`)
}

// Price, stock and whether the edition is offered. A blank stock means made
// to order, with no limit.
export async function saveProductOption(formData: FormData): Promise<void> {
  const productId = String(formData.get('product_id') ?? '')
  const id = String(formData.get('id') ?? '')
  if (!UUID.test(productId) || !UUID.test(id)) redirect('/admin/products')

  const { error: authError } = await requireAdmin()
  if (authError) back(productId, 'You are not signed in as an admin.')

  const price = poundsToPence(String(formData.get('price') ?? ''))
  if (price === null || price <= 0) back(productId, 'Each edition needs a price above zero.')

  const stockRaw = String(formData.get('stock') ?? '').trim()
  const stock = stockRaw === '' ? null : Number(stockRaw)
  if (stock !== null && (!Number.isInteger(stock) || stock < 0 || stock > 100000)) {
    back(productId, 'Stock must be a whole number, or blank for made to order.')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('charlie_product_options')
    .update({ price_pence: price, stock_count: stock, is_active: formData.get('is_active') === 'on' })
    .eq('id', id)
    .eq('product_id', productId)
  revalidatePath('/shop', 'layout')
  revalidatePath(`/admin/products/${productId}/edit`)
  if (error) {
    console.error(`[admin] could not save option ${id}:`, error.message)
    back(productId, `Could not save the edition: ${error.message}`)
  }
  back(productId)
}

// Give a print Brian's two editions, so a print added in the admin can be
// sold the same way as the rest. Does nothing to editions already there.
export async function addPrintEditions(formData: FormData): Promise<void> {
  const productId = String(formData.get('product_id') ?? '')
  if (!UUID.test(productId)) redirect('/admin/products')

  const { error: authError } = await requireAdmin()
  if (authError) back(productId, 'You are not signed in as an admin.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('charlie_product_options').upsert(
    PRINT_EDITIONS.map((e, i) => ({
      product_id: productId,
      code: e.code,
      name: e.name,
      detail: e.detail,
      price_pence: e.price_pence,
      stock_count: e.stock_count,
      display_order: i,
      is_active: true,
    })),
    { onConflict: 'product_id,code', ignoreDuplicates: true },
  )
  revalidatePath('/shop', 'layout')
  if (error) {
    console.error(`[admin] could not add editions to ${productId}:`, error.message)
    back(productId, `Could not add the editions: ${error.message}`)
  }
  back(productId)
}
