import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type { EnquiryDetails } from './enquiry-input'

// Enquiries are written through the service role only. The table has no
// public policy (see 20261012090000_charlie-shop-enquiries.sql), so this file
// is the single path between a customer and the admins. Never import it from
// a Client Component.

export type EnquiryStatus = 'new' | 'replied' | 'closed'

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  replied: 'Replied',
  closed: 'Closed',
}

export interface Enquiry {
  id: string
  product_id: string | null
  product_slug: string
  product_title: string
  name: string
  email: string
  phone: string | null
  message: string
  status: EnquiryStatus
  created_at: string
}

export const ENQUIRY_COLUMNS =
  'id, product_id, product_slug, product_title, name, email, phone, message, status, created_at'

// A crude brake on a script filling the table. A real person asking about a
// few paintings in one sitting stays well under it.
const MAX_PER_EMAIL_PER_HOUR = 5

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type SaveEnquiryResult = { ok: true; id: string } | { ok: false; reason: 'rate' | 'error' }

export async function saveEnquiry(input: {
  product: { id: string; slug: string; title: string }
  details: EnquiryDetails
}): Promise<SaveEnquiryResult> {
  const supabase = createSupabaseServiceClient()

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await supabase
    .from('charlie_enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('email', input.details.email)
    .gte('created_at', since)
  if (countError) {
    console.error('[shop] enquiry rate check failed:', countError.message)
    return { ok: false, reason: 'error' }
  }
  if ((count ?? 0) >= MAX_PER_EMAIL_PER_HOUR) return { ok: false, reason: 'rate' }

  const { data, error } = await supabase
    .from('charlie_enquiries')
    .insert({
      // The local catalogue uses the slug as its id; only a real row id can
      // satisfy the foreign key.
      product_id: UUID.test(input.product.id) ? input.product.id : null,
      product_slug: input.product.slug,
      product_title: input.product.title,
      name: input.details.name,
      email: input.details.email,
      phone: input.details.phone,
      message: input.details.message,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[shop] saving enquiry failed:', error?.message ?? 'no row returned')
    return { ok: false, reason: 'error' }
  }
  return { ok: true, id: (data as { id: string }).id }
}
