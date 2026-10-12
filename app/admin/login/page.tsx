import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { AuthPanel } from '../AuthPanel'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured()

  return (
    <AuthPanel>
      {configured ? (
        <Suspense
          fallback={<div className="font-sans text-small text-ink-mute">Loading</div>}
        >
          <LoginForm />
        </Suspense>
      ) : (
        <div className="font-sans text-small text-ink-soft space-y-3">
          <p className="font-medium text-ink">Supabase is not configured.</p>
          <p>
            Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
            SUPABASE_SERVICE_ROLE_KEY in .env.local, run the migrations in
            supabase/migrations, then create an admin user in the Supabase
            dashboard to sign in here.
          </p>
        </div>
      )}
    </AuthPanel>
  )
}
