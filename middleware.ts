import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Run on admin and shop routes (where auth/session matter). Skips static
  // assets and the public archive pages, which need no session.
  matcher: ['/admin/:path*', '/shop/:path*', '/api/admin/:path*'],
}
