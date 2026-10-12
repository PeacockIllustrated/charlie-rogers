import type { Metadata } from 'next'
import { AuthPanel } from '../AuthPanel'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
}

// Reached from the reset email, through /api/admin/auth/callback, which has
// already signed the admin in. Middleware sends anyone without a session to
// the sign in page. Kept outside the (app) group so the sidebar does not show
// while a password is being changed.
export default function ResetPasswordPage() {
  return (
    <AuthPanel>
      <ResetPasswordForm />
    </AuthPanel>
  )
}
