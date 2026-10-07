'use client'

import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { placeOrderAction, type CheckoutState } from '@/app/(public)/shop/actions'
import { formatPence } from '@/lib/shop/utils'
import type { CheckoutField } from '@/lib/shop/checkout-input'
import { Button } from '@/components/Button'
import { useBasket } from './BasketProvider'
import { useQuote } from './useQuote'
import { Notices } from './BasketView'
import { OrderTotals } from './OrderSummary'

function Field({
  name,
  label,
  state,
  optional = false,
  autoComplete,
  type = 'text',
  className = '',
}: {
  name: CheckoutField
  label: string
  state: CheckoutState
  optional?: boolean
  autoComplete?: string
  type?: string
  className?: string
}) {
  const error = state.errors?.[name]
  const id = `checkout-${name}`
  return (
    <div className={className}>
      <label htmlFor={id} className="input-label">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-ink-mute">optional</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={!optional}
        autoComplete={autoComplete}
        defaultValue={state.values?.[name] ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input ${error ? 'border-bensham' : ''}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 font-sans text-small text-bensham">
          {error}
        </p>
      )}
    </div>
  )
}

function Submit({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-bensham px-5 py-3 font-sans text-small font-medium text-paper transition-colors duration-colour hover:bg-bensham-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Placing your order' : label}
    </button>
  )
}

export function CheckoutForm({ paymentNote, submitLabel }: { paymentNote: string; submitLabel: string }) {
  const { lines, replace } = useBasket()
  const { quote, notices, loading, failed } = useQuote()
  const [state, formAction] = useActionState(placeOrderAction, {} as CheckoutState)

  // The server found the basket had changed. Take its corrected version, which
  // re-prices the summary beside the form, and leave the customer to look
  // again before placing the order.
  useEffect(() => {
    if (state.revisedBasket) replace(state.revisedBasket)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  if (failed && !quote) {
    return (
      <p className="max-w-reading font-serif text-body text-ink-soft">
        Your basket could not be priced just now. Please refresh the page to try again.
      </p>
    )
  }
  if (loading && !quote) {
    return <p className="font-sans text-small text-ink-mute">Loading your basket.</p>
  }
  if (!quote || quote.lines.length === 0) {
    return (
      <div className="max-w-reading space-y-6">
        <Notices notices={notices} />
        <p className="font-serif text-body text-ink-soft">Your basket is empty, so there is nothing to check out.</p>
        <Button href="/shop">Back to the shop</Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-12" noValidate>
      <input type="hidden" name="basket" value={JSON.stringify(lines)} />

      <div className="space-y-10 lg:col-span-7">
        {state.message && (
          <div role="alert" className="border border-bensham bg-paper p-4 font-sans text-small text-ink">
            {state.message}
          </div>
        )}
        <Notices notices={notices} />

        <fieldset className="space-y-5">
          <legend className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Your details</legend>
          <Field name="name" label="Full name" autoComplete="name" state={state} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="email" label="Email" type="email" autoComplete="email" state={state} />
            <Field name="phone" label="Phone" type="tel" autoComplete="tel" optional state={state} />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Delivery address</legend>
          <p className="font-sans text-small text-ink-mute">We post within the United Kingdom only.</p>
          <Field name="line1" label="Address" autoComplete="address-line1" state={state} />
          <Field name="line2" label="Address, second line" autoComplete="address-line2" optional state={state} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="town" label="Town or city" autoComplete="address-level2" state={state} />
            <Field name="county" label="County" autoComplete="address-level1" optional state={state} />
          </div>
          <Field name="postcode" label="Postcode" autoComplete="postal-code" className="sm:w-1/2" state={state} />
        </fieldset>

        <div>
          <label htmlFor="checkout-notes" className="input-label">
            A note with your order
            <span className="ml-2 normal-case tracking-normal text-ink-mute">optional</span>
          </label>
          <textarea
            id="checkout-notes"
            name="notes"
            rows={3}
            defaultValue={state.values?.notes ?? ''}
            className="input"
            aria-invalid={state.errors?.notes ? true : undefined}
          />
          {state.errors?.notes && <p className="mt-1 font-sans text-small text-bensham">{state.errors.notes}</p>}
        </div>
      </div>

      <aside className="self-start border border-rule border-t-2 border-t-bensham bg-paper-warm p-6 lg:col-span-5">
        <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Your order</p>
        <ul className="mt-4 space-y-3 border-b border-rule pb-4">
          {quote.lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-4 font-serif text-body">
              <span>
                {l.title}
                <span className="font-sans text-small text-ink-mute"> &times; {l.quantity}</span>
              </span>
              <span className="shrink-0">{formatPence(l.lineTotalPence)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <OrderTotals subtotalPence={quote.subtotalPence} postagePence={quote.postagePence} totalPence={quote.totalPence} />
        </div>
        <p className="mt-5 font-sans text-small text-ink-soft">{paymentNote}</p>
        <div className="mt-5">
          <Submit disabled={loading} label={submitLabel} />
        </div>
        <Link href="/shop/basket" className="mt-4 inline-block font-sans text-small text-ink-soft underline-offset-4 hover:underline">
          Change your basket
        </Link>
      </aside>
    </form>
  )
}
