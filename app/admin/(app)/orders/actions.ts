'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/shop/orders'
import { poundsToPence } from '@/lib/shop/product-input'

const UUID = /^[0-9a-f-]{36}$/

// Send the admin back to the list they were on, with a sentence when something
// went wrong. Failures used to be logged and nothing else, so a refused button
// press looked exactly like one that had worked.
function back(formData: FormData, error?: string): never {
  const filter = String(formData.get('filter') ?? '')
  const params = new URLSearchParams()
  if (filter && filter !== 'all') params.set('status', filter)
  if (error) params.set('error', error)
  const qs = params.toString()
  redirect(qs ? `/admin/orders?${qs}` : '/admin/orders')
}

// Move an order on: paid, posted, completed, cancelled. Runs as the signed-in
// admin, not the service role, so the row level security policy on
// charlie_orders is what decides. requireAdmin() is the polite early exit.
//
// Cancelling puts the stock back (a trigger in the orders migration), and a
// cancelled order cannot be reopened.
export async function setOrderStatus(formData: FormData): Promise<void> {
  const { error: authError } = await requireAdmin()
  if (authError) back(formData, 'You are not signed in as an admin.')

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  if (!UUID.test(id) || !(status in ORDER_STATUS_LABELS)) back(formData, 'That order could not be found.')

  const supabase = await createSupabaseServerClient()
  const patch: { status: OrderStatus; paid_at?: string } = { status }
  if (status === 'paid') patch.paid_at = new Date().toISOString()
  const { error } = await supabase.from('charlie_orders').update(patch).eq('id', id)
  revalidatePath('/admin', 'layout')
  if (error) {
    console.error(`[admin] could not set order ${id} to ${status}:`, error.message)
    back(
      formData,
      error.message.includes('charlie_order:closed')
        ? 'A cancelled order cannot be reopened. Place a new order instead.'
        : `Could not update the order: ${error.message}`,
    )
  }
  back(formData)
}

// Record the postage on an order. Orders placed while UK postage was unset
// arrive with none, and the total the customer is asked to pay has to include
// it. The total is recomputed from the subtotal here rather than trusted from
// the form.
export async function setOrderPostage(formData: FormData): Promise<void> {
  const { error: authError } = await requireAdmin()
  if (authError) back(formData, 'You are not signed in as an admin.')

  const id = String(formData.get('id') ?? '')
  if (!UUID.test(id)) back(formData, 'That order could not be found.')

  const raw = String(formData.get('postage') ?? '').trim().replace(/^£/, '')
  const postage = raw === '' ? null : poundsToPence(raw)
  if (raw !== '' && (postage === null || postage < 0 || postage > 10000)) {
    back(formData, 'Enter postage in pounds, such as 3.95, or leave it blank.')
  }

  const supabase = await createSupabaseServerClient()
  const { data: order, error: readErr } = await supabase
    .from('charlie_orders')
    .select('subtotal_pence, status')
    .eq('id', id)
    .maybeSingle()
  if (readErr || !order) back(formData, 'That order could not be found.')

  const row = order as { subtotal_pence: number; status: OrderStatus }
  if (row.status !== 'pending' && row.status !== 'paid') {
    back(formData, 'Postage can only be changed before an order is posted.')
  }

  const { error } = await supabase
    .from('charlie_orders')
    .update({ postage_pence: postage, total_pence: row.subtotal_pence + (postage ?? 0) })
    .eq('id', id)
  revalidatePath('/admin', 'layout')
  if (error) {
    console.error(`[admin] could not set postage on order ${id}:`, error.message)
    back(formData, `Could not save the postage: ${error.message}`)
  }
  back(formData)
}
