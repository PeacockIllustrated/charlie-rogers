'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  // Only ever back into the admin, so a crafted link cannot send a fresh
  // sign in off to another site.
  const nextParam = params.get('next') ?? '/admin'
  const next = /^\/admin(\/[a-z0-9/-]*)?$/.test(nextParam) ? nextParam : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Set by the reset link callback when a link was used twice or has expired.
  const [error, setError] = useState<string | null>(
    params.get('error') === 'link'
      ? 'That reset link has expired or has already been used. Ask for a new one.'
      : null,
  )
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setPending(false)
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div>
        <label htmlFor="password" className="input-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="border border-bensham/30 bg-bensham/5 px-3 py-2 font-sans text-small text-bensham">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-admin w-full">
        {pending ? 'Signing in' : 'Sign in'}
      </button>

      <div className="flex flex-wrap items-baseline justify-between gap-2 pt-2 font-sans text-xs text-ink-mute">
        <Link href="/admin/forgot-password" className="hover:text-bensham">
          Forgotten your password?
        </Link>
        <span>Accounts are by invitation only.</span>
      </div>
    </form>
  )
}
