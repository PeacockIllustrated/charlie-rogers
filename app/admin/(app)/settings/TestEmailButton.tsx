'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendTestEmailAction, type TestEmailState } from './actions'

function Send({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={disabled || pending} className="btn-admin-outline disabled:cursor-not-allowed disabled:opacity-50">
      {pending ? 'Sending' : 'Send a test email'}
    </button>
  )
}

export function TestEmailButton({ disabled }: { disabled: boolean }) {
  const [state, action] = useActionState(sendTestEmailAction, {} as TestEmailState)
  return (
    <form action={action} className="space-y-3">
      <Send disabled={disabled} />
      {state.message && (
        <p
          role="status"
          className={`font-sans text-small ${state.ok ? 'text-ink' : 'text-bensham'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
