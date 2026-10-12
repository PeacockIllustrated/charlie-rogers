'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const supabase = createSupabaseBrowserClient()
    const redirectTo = `${window.location.origin}/api/admin/auth/callback?next=/admin/reset-password`
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    setPending(false)
    // Supabase answers the same whether or not the address has an account, so
    // this says the same too. Only a delivery failure (rate limit, no mail
    // set up) is worth showing.
    if (authError) {
      setError(authError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 font-sans text-small text-ink-soft">
        <p className="font-serif text-h4 text-ink">Check your email</p>
        <p>
          If {email} has an admin account, a link to set a new password is on
          its way. It works once and expires after an hour.
        </p>
        <Link href="/admin/login" className="inline-block text-ink-soft underline underline-offset-4 hover:text-bensham">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-sans text-small text-ink-soft">
        Enter the email you sign in with and we will send you a link to set a
        new password.
      </p>
      <div>
        <label htmlFor="email" className="input-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="border border-bensham/30 bg-bensham/5 px-3 py-2 font-sans text-small text-bensham">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-admin w-full">
        {pending ? 'Sending' : 'Send reset link'}
      </button>

      <p className="pt-2 text-center">
        <Link href="/admin/login" className="font-sans text-xs text-ink-mute hover:text-bensham">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
