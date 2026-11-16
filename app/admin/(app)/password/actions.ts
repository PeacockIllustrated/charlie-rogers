'use server'

import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import { PASSWORD_MIN_LENGTH, passwordChangedStamp } from '@/lib/admin-password'

export interface ChangePasswordResult {
  ok?: boolean
  error?: string
}

// Change the signed-in admin's password, after checking the current one.
// Supabase would change it for any signed-in session without asking, so the
// check stops someone at an unattended, signed-in computer locking the owner
// out. The check runs on a separate client that keeps nothing: a failed
// sign in on the browser's own client would sign the admin out.
export async function changePassword(current: string, next: string): Promise<ChangePasswordResult> {
  const { user, error: authError } = await requireAdmin()
  if (authError || !user?.email) return { error: 'You are not signed in as an admin. Sign in again and retry.' }

  if (next.length < PASSWORD_MIN_LENGTH) return { error: `Use at least ${PASSWORD_MIN_LENGTH} characters.` }
  if (next === current) return { error: 'The new password is the same as the current one.' }

  const checker = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { error: checkError } = await checker.auth.signInWithPassword({ email: user.email, password: current })
  if (checkError) return { error: 'The current password is not right.' }

  // Changed through the session the check just opened, which counts as a
  // fresh sign in if the project asks for one before a password change.
  const { error: updateError } = await checker.auth.updateUser({ password: next, data: passwordChangedStamp() })
  // End only that session. The default would end every session for the
  // account, including the one in use.
  await checker.auth.signOut({ scope: 'local' })
  if (updateError) return { error: updateError.message }

  return { ok: true }
}
