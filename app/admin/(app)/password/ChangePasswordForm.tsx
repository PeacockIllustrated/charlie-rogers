'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PASSWORD_MIN_LENGTH } from '@/lib/admin-password'
import { changePassword } from './actions'

export function ChangePasswordForm({ email }: { email: string }) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Use at least ${PASSWORD_MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two new passwords do not match.')
      return
    }
    if (password === current) {
      setError('The new password is the same as the current one.')
      return
    }

    setPending(true)
    const result = await changePassword(current, password).catch(() => ({
      ok: false,
      error: 'The password could not be changed. Check the connection and try again.',
    }))
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? 'The password could not be changed. Try again.')
      return
    }

    setCurrent('')
    setPassword('')
    setConfirm('')
    setDone(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lets a password manager match the new password to the account. */}
      <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
      <div>
        <label htmlFor="current" className="input-label">
          Current password
        </label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="password" className="input-label">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="mt-1 font-sans text-xs text-ink-mute">
          At least {PASSWORD_MIN_LENGTH} characters. A few unrelated words is easy to remember and hard to guess.
        </p>
      </div>
      <div>
        <label htmlFor="confirm" className="input-label">
          New password again
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
        <p role="alert" className="border border-bensham/30 bg-bensham/5 px-3 py-2 font-sans text-small text-bensham">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="border border-rule border-l-4 border-l-sage bg-paper px-3 py-2 font-sans text-small text-ink">
          Your password has been changed. Use the new one next time you sign in.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-admin">
        {pending ? 'Saving' : 'Change password'}
      </button>
    </form>
  )
}
