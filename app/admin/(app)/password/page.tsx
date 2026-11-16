import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ChangePasswordForm } from './ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Change your password',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// For an admin who is signed in and knows their password. Anyone who has
// forgotten it uses the emailed link from the sign in page instead.
export default async function ChangePasswordPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-serif text-h1">Change your password</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          For {user?.email ?? 'this account'}. You will stay signed in.
        </p>
      </div>

      <div className="border border-rule bg-paper p-6">
        <ChangePasswordForm email={user?.email ?? ''} />
      </div>

      <p className="max-w-reading font-sans text-small text-ink-soft">
        Forgotten the current one? Sign out, then use{' '}
        <Link href="/admin/forgot-password" className="underline underline-offset-2 hover:text-bensham">
          Forgotten your password
        </Link>{' '}
        on the sign in page. A link to set a new one is emailed to you.
      </p>
    </div>
  )
}
