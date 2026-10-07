'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/shop/orders'

// Move an order on: paid, posted, completed, cancelled. Runs as the signed-in
// admin, not the service role, so the row level security policy on
// charlie_orders is what decides. requireAdmin() is the polite early exit.
//
// Cancelling puts the stock back (a trigger in the orders migration), and a
// cancelled order cannot be reopened.
export async function setOrderStatus(formData: FormData): Promise<void> {
  const { error: authError } = await requireAdmin()
  if (authError) return

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  if (!/^[0-9a-f-]{36}$/.test(id) || !(status in ORDER_STATUS_LABELS)) return

  const supabase = await createSupabaseServerClient()
  const patch: { status: OrderStatus; paid_at?: string } = { status }
  if (status === 'paid') patch.paid_at = new Date().toISOString()
  const { error } = await supabase.from('charlie_orders').update(patch).eq('id', id)
  if (error) console.error(`[admin] could not set order ${id} to ${status}:`, error.message)
  revalidatePath('/admin/orders')
}
