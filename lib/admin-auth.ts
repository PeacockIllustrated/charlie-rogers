import { NextResponse } from 'next/server'
import { createSupabaseServerClient, isSupabaseConfigured } from './supabase/server'

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

  return { user, error: null }
}
