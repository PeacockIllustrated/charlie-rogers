import { NextResponse } from 'next/server'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'

// Where the password reset email lands. Supabase sends a one-time code, which
// is swapped here for a session, and the admin is sent on to set a new
// password. Only admin paths are accepted as the destination, so the link
// cannot be bent into a redirect to another site.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') ?? '/admin/reset-password'
  const next = /^\/admin(\/[a-z0-9/-]*)?$/.test(nextParam) ? nextParam : '/admin/reset-password'

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/admin/login?error=link', url.origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[admin] could not exchange reset code:', error.message)
    return NextResponse.redirect(new URL('/admin/login?error=link', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
