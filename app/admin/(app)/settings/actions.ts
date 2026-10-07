'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-auth'
import { poundsToPence } from '@/lib/shop/product-input'

export interface SettingsState {
  ok?: boolean
  errors?: Partial<Record<'checkoutMode' | 'postage' | 'notifyEmail' | 'form', string>>
}

// Save the shop settings. Runs as the signed-in admin, so the row level
// security policy on charlie_shop_settings is the real check.
export async function saveShopSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const { user, error: authError } = await requireAdmin()
  if (authError || !user) return { errors: { form: 'You are not signed in as an admin.' } }

  const errors: SettingsState['errors'] = {}

  const mode = String(formData.get('checkoutMode') ?? '')
  if (mode !== 'closed' && mode !== 'manual') errors.checkoutMode = 'Choose whether the checkout is open.'

  const postageRaw = String(formData.get('postage') ?? '').trim().replace(/^£/, '')
  let postage: number | null = null
  if (postageRaw !== '') {
    const pence = poundsToPence(postageRaw)
    if (pence === null || pence < 0 || pence > 10000) errors.postage = 'Enter an amount in pounds, such as 3.95, or leave it blank.'
    else postage = pence
  }

  const email = String(formData.get('notifyEmail') ?? '').trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.notifyEmail = 'This does not look like an email address.'

  if (Object.keys(errors).length > 0) return { errors }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('charlie_shop_settings')
    .update({
      checkout_mode: mode,
      uk_postage_pence: postage,
      order_notify_email: email || null,
      updated_by: user.id,
    })
    .eq('id', true)

  if (error) {
    console.error('[admin] could not save shop settings:', error.message)
    return { errors: { form: `Could not save: ${error.message}` } }
  }

  // Every shop page reads these, so refresh the lot.
  revalidatePath('/shop', 'layout')
  revalidatePath('/admin/settings')
  return { ok: true }
}
