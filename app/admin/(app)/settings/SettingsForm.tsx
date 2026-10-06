'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { saveShopSettings, type SettingsState } from './actions'

const MODES = [
  {
    value: 'closed',
    label: 'Closed',
    detail: 'Nothing can be ordered. The book and the cards show an enquiry button, like the paintings.',
  },
  {
    value: 'manual',
    label: 'Open, payment by arrangement',
    detail: 'Customers can order the book and the cards. Copies are reserved, no card payment is taken, and you email each customer to arrange payment and postage.',
  },
] as const

function Save() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-admin">
      {pending ? 'Saving' : 'Save settings'}
    </button>
  )
}

export function SettingsForm({
  initial,
}: {
  initial: { checkoutMode: string; postage: string; notifyEmail: string }
}) {
  const [state, action] = useActionState(saveShopSettings, {} as SettingsState)
  const e = state.errors ?? {}

  return (
    <form action={action} className="space-y-8">
      {e.form && (
        <div role="alert" className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          {e.form}
        </div>
      )}
      {state.ok && (
        <div role="status" className="border border-sage bg-sage/10 px-4 py-3 font-sans text-small text-ink">
          Saved. The shop is using these settings now.
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="input-label">Checkout</legend>
        {MODES.map((m) => (
          <label key={m.value} className="flex gap-3 border border-rule bg-paper p-4">
            <input
              type="radio"
              name="checkoutMode"
              value={m.value}
              defaultChecked={initial.checkoutMode === m.value}
              className="mt-1"
            />
            <span>
              <span className="block font-sans text-small font-medium text-ink">{m.label}</span>
              <span className="mt-1 block font-sans text-small text-ink-soft">{m.detail}</span>
            </span>
          </label>
        ))}
        <p className="font-sans text-xs text-ink-mute">
          Card payment through Stripe will appear here once it is built.
        </p>
        {e.checkoutMode && <p className="font-sans text-small text-bensham">{e.checkoutMode}</p>}
      </fieldset>

      <div className="max-w-xs">
        <label htmlFor="postage" className="input-label">
          UK postage per order, in pounds
        </label>
        <input id="postage" name="postage" inputMode="decimal" defaultValue={initial.postage} placeholder="Blank means to be confirmed" className="input" />
        <p className="mt-1 font-sans text-xs text-ink-mute">Enter 0 for free postage. Leave it blank and totals read “before postage”.</p>
        {e.postage && <p className="mt-1 font-sans text-small text-bensham">{e.postage}</p>}
      </div>

      <div className="max-w-md">
        <label htmlFor="notifyEmail" className="input-label">
          Send new orders to
        </label>
        <input id="notifyEmail" name="notifyEmail" type="email" defaultValue={initial.notifyEmail} className="input" />
        <p className="mt-1 font-sans text-xs text-ink-mute">One address. Leave it blank to rely on the Orders page alone.</p>
        {e.notifyEmail && <p className="mt-1 font-sans text-small text-bensham">{e.notifyEmail}</p>}
      </div>

      <Save />
    </form>
  )
}
