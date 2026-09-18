import { NextResponse } from 'next/server'
import { createSupabaseServerClient, isSupabaseConfigured } from './supabase/server'

// Is this user on the charlie_admins roster? Calls the charlie_is_admin()
// SECURITY DEFINER function added in 20260918090000_charlie-shop-admin-authz.sql.
//
// Being signed in is not enough. CLAUDE.md states this is a shared project
// database, so a session proves only that someone has an account somewhere on
// the instance, not that they may touch this project's tables.
//
// This is a convenience for the UI and for honest error codes. The real
// boundary is the row level security policy, which applies whether or not this
// function is called.
export async function isAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc('charlie_is_admin')
  if (error) return false
  return data === true
}

// Verify the caller is a signed-in admin. Returns the user, or a NextResponse
// to return immediately. Use at the top of every admin API route.
export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 503 },
      ),
    }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Signed in, but is this account allowed to administer this project?
  const { data: admin, error: rpcErr } = await supabase.rpc('charlie_is_admin')
  if (rpcErr || admin !== true) {
    // 403, not 401: the session is valid, the account simply has no standing
    // here. Re-authenticating would not change the outcome.
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { user, error: null }
}
