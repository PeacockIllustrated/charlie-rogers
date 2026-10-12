'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendEnquiryAction, type EnquiryState } from '@/app/(public)/shop/enquire'
import type { EnquiryField } from '@/lib/shop/enquiry-input'

function Field({
  name,
  label,
  state,
  optional = false,
  autoComplete,
  type = 'text',
}: {
  name: Exclude<EnquiryField, 'message'>
  label: string
  state: EnquiryState
  optional?: boolean
  autoComplete?: string
  type?: string
}) {
  const error = state.errors?.[name]
  const id = `enquiry-${name}`
  return (
    <div>
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

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-bensham px-4 py-2.5 font-sans text-small font-medium text-paper transition-colors duration-colour hover:bg-bensham-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Sending' : 'Send enquiry'}
    </button>
  )
}

// The enquiry route for everything that cannot be put in the basket. Goes to
// the admins, not to an address published on the page.
export function EnquiryForm({ slug, title, prompt }: { slug: string; title: string; prompt: string }) {
  const [state, formAction] = useActionState(sendEnquiryAction, {} as EnquiryState)

  if (state.sent) {
    return (
      <div role="status" className="border-t border-rule pt-5">
        <p className="font-serif text-h4">Thank you, your enquiry has been sent</p>
        <p className="mt-2 font-sans text-small text-ink-soft">
          We will reply by email about {title}.
        </p>
      </div>
    )
  }

  return (
    <form id="enquire" action={formAction} className="space-y-5 border-t border-rule pt-5 scroll-mt-24" noValidate>
      <div>
        <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Enquire about this</p>
        <p className="mt-2 font-sans text-small text-ink-soft">
          This is not sold online yet. Send a message and we will reply by email.
        </p>
      </div>

      {state.message && (
        <div role="alert" className="border border-bensham bg-paper p-3 font-sans text-small text-ink">
          {state.message}
        </div>
      )}

      <input type="hidden" name="slug" value={slug} />
      {/* Hidden from people and from screen readers; only a script fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="enquiry-website">Leave this empty</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <Field name="name" label="Your name" autoComplete="name" state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" label="Email" type="email" autoComplete="email" state={state} />
        <Field name="phone" label="Phone" type="tel" autoComplete="tel" optional state={state} />
      </div>
      <div>
        <label htmlFor="enquiry-message" className="input-label">
          Your message
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          required
          placeholder={prompt}
          defaultValue={state.values?.message ?? ''}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? 'enquiry-message-error' : undefined}
          className={`input ${state.errors?.message ? 'border-bensham' : ''}`}
        />
        {state.errors?.message && (
          <p id="enquiry-message-error" className="mt-1 font-sans text-small text-bensham">
            {state.errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Submit />
        <p className="font-sans text-xs text-ink-mute">Your details are used only to reply to you.</p>
      </div>
    </form>
  )
}
