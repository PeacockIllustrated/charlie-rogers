'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const MIN_LENGTH = 10

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setPending(true)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.updateUser({ password })
    if (authError) {
      setError(authError.message)
      setPending(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-sans text-small text-ink-soft">
        Choose a new password. You will stay signed in.
      </p>
      <div>
        <label htmlFor="password" className="input-label">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="input-label">
          Type it again
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="border border-bensham/30 bg-bensham/5 px-3 py-2 font-sans text-small text-bensham">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-admin w-full">
        {pending ? 'Saving' : 'Save new password'}
      </button>
    </form>
  )
}
