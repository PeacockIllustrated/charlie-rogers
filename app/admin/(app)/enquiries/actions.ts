'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { ENQUIRY_STATUS_LABELS, type EnquiryStatus } from '@/lib/shop/enquiries'

// Mark an enquiry replied or closed, or reopen it. Runs as the signed-in
// admin, so the row level security policy on charlie_enquiries decides.
export async function setEnquiryStatus(formData: FormData): Promise<void> {
  const { error: authError } = await requireAdmin()
  if (authError) return

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as EnquiryStatus
  if (!/^[0-9a-f-]{36}$/.test(id) || !(status in ENQUIRY_STATUS_LABELS)) return

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('charlie_enquiries').update({ status }).eq('id', id)
  if (error) console.error(`[admin] could not set enquiry ${id} to ${status}:`, error.message)
  revalidatePath('/admin/enquiries')
  revalidatePath('/admin')
}
