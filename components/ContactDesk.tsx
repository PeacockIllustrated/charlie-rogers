'use client'

import { startTransition, useActionState, useRef, useState, type FormEvent } from 'react'
import { sendContactAction, type ContactState } from '@/app/(public)/contact/actions'
import { CONTACT_IMAGES, type ContactTopic, type Topic } from '@/lib/contact'

// The contact page's working part: Brian's sections on the left, each of which
// picks the subject of the form on the right. One component, because choosing
// a section and writing the message are the same act.

const NUMERALS = ['i', 'ii', 'iii', 'iv', 'v', 'vi']

// Shrink a photograph in the browser so several fit in one request. Keeps
// the original when the browser cannot decode it (the server then checks it).
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, CONTACT_IMAGES.longest / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    for (const q of [0.86, 0.78, 0.68, 0.58]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', q))
      if (blob && blob.size <= CONTACT_IMAGES.maxBytes) return blob
    }
    return file
  } catch {
    return file
  }
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null
  return (
    <p id={id} className="mt-1 font-sans text-small text-bensham">
      {text}
    </p>
  )
}

export function ContactDesk({ topics, initial = 'question' }: { topics: Topic[]; initial?: ContactTopic }) {
  const [state, formAction, pending] = useActionState(sendContactAction, {} as ContactState)
  const [topic, setTopic] = useState<ContactTopic>((state.values?.topic as ContactTopic) || initial)
  const [photos, setPhotos] = useState<File[]>([])
  const [preparing, setPreparing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const current = topics.find((t) => t.slug === topic) ?? topics[0]
  const sections = topics.filter((t) => t.text.length > 0)

  function choose(slug: ContactTopic, scroll: boolean) {
    setTopic(slug)
    if (scroll) {
      const form = formRef.current
      form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // After the scroll, so the page does not jump twice.
      window.setTimeout(() => form?.querySelector<HTMLInputElement>('#contact-name')?.focus({ preventScroll: true }), 450)
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.delete('images')
    if (current.images && photos.length > 0) {
      setPreparing(true)
      const shrunk = await Promise.all(photos.slice(0, CONTACT_IMAGES.max).map(shrink))
      shrunk.forEach((b, i) => fd.append('images', b, `photograph-${i + 1}.jpg`))
      setPreparing(false)
    }
    startTransition(() => formAction(fd))
  }

  const busy = pending || preparing

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Brian's sections */}
      <ol className="min-w-0 border-t-2 border-ink lg:col-span-6">
        {sections.map((t, i) => {
          const active = t.slug === topic
          return (
            <li key={t.slug} className="border-b border-rule">
              <div
                className={`group relative grid grid-cols-[2.5rem_1fr] gap-x-4 py-7 pl-1 pr-2 transition-colors duration-colour sm:grid-cols-[3.5rem_1fr] ${
                  active ? 'bg-paper-warm' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-[3px] transition-colors duration-colour ${active ? 'bg-bensham' : 'bg-transparent'}`}
                />
                <span
                  aria-hidden="true"
                  className={`pl-3 pt-1 font-serif text-h3 italic leading-none ${active ? 'text-bensham' : 'text-ink-mute'}`}
                >
                  {NUMERALS[i]}
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif text-h2 leading-tight">{t.title}</h2>
                  {t.text.map((p) => (
                    <p key={p} className="mt-3 max-w-reading font-serif text-body text-ink-soft">
                      {p}
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={() => choose(t.slug, true)}
                    aria-pressed={active}
                    className={`mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-eyebrow transition-colors duration-colour ${
                      active ? 'text-bensham' : 'text-ink-soft hover:text-bensham'
                    }`}
                  >
                    {active ? 'Writing about this' : 'Write about this'}
                    <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true" className="transition-transform duration-fade group-hover:translate-x-1">
                      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* The form */}
      <div className="min-w-0 lg:col-span-6">
        <div className="lg:sticky lg:top-[6.5rem]">
          {state.sent ? (
            <div role="status" className="border border-rule border-t-2 border-t-bensham bg-paper-warm p-6 sm:p-8">
              <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Sent</p>
              <p className="mt-3 font-serif text-h2">Thank you, your message is on its way</p>
              <p className="mt-3 font-serif text-body text-ink-soft">
                Brian Rankin will reply by email.
                {state.imagesFailed
                  ? ` ${state.imagesFailed === 1 ? 'One photograph' : 'Some photographs'} could not be sent with it, so he may ask for ${state.imagesFailed === 1 ? 'it' : 'them'} in his reply.`
                  : ''}
              </p>
            </div>
          ) : (
            <form
              ref={formRef}
              id="message"
              onSubmit={onSubmit}
              noValidate
              className="scroll-mt-28 border border-rule border-t-2 border-t-bensham bg-paper p-6 sm:p-8"
            >
              <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Send a message</p>
              <p className="mt-2 font-serif text-h3">{current.slug === 'question' ? 'A question about Charlie' : current.title}</p>

              {state.message && (
                <div role="alert" className="mt-5 border border-bensham p-3 font-sans text-small text-ink">
                  {state.message}
                </div>
              )}

              <fieldset className="mt-6">
                <legend className="input-label">About</legend>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <label
                      key={t.slug}
                      className={`cursor-pointer border px-3 py-1.5 font-sans text-small transition-colors duration-colour has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ochre ${
                        t.slug === topic
                          ? 'border-bensham bg-bensham text-paper'
                          : 'border-rule text-ink-soft hover:border-ink-mute hover:text-ink'
                      }`}
                    >
                      <input
                        type="radio"
                        name="topic"
                        value={t.slug}
                        checked={t.slug === topic}
                        onChange={() => choose(t.slug, false)}
                        className="sr-only"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
                <FieldError id="contact-topic-error" text={state.errors?.topic} />
              </fieldset>

              {/* Hidden from people and screen readers; only a script fills it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="contact-website">Leave this empty</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="input-label">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    defaultValue={state.values?.name ?? ''}
                    aria-invalid={state.errors?.name ? true : undefined}
                    aria-describedby={state.errors?.name ? 'contact-name-error' : undefined}
                    className={`input ${state.errors?.name ? 'border-bensham' : ''}`}
                  />
                  <FieldError id="contact-name-error" text={state.errors?.name} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-email" className="input-label">Email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      defaultValue={state.values?.email ?? ''}
                      aria-invalid={state.errors?.email ? true : undefined}
                      aria-describedby={state.errors?.email ? 'contact-email-error' : undefined}
                      className={`input ${state.errors?.email ? 'border-bensham' : ''}`}
                    />
                    <FieldError id="contact-email-error" text={state.errors?.email} />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="input-label">
                      Phone<span className="ml-2 normal-case tracking-normal text-ink-mute">optional</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      defaultValue={state.values?.phone ?? ''}
                      aria-invalid={state.errors?.phone ? true : undefined}
                      aria-describedby={state.errors?.phone ? 'contact-phone-error' : undefined}
                      className={`input ${state.errors?.phone ? 'border-bensham' : ''}`}
                    />
                    <FieldError id="contact-phone-error" text={state.errors?.phone} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="input-label">Your message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    required
                    placeholder={current.prompt}
                    defaultValue={state.values?.message ?? ''}
                    aria-invalid={state.errors?.message ? true : undefined}
                    aria-describedby={state.errors?.message ? 'contact-message-error' : undefined}
                    className={`input ${state.errors?.message ? 'border-bensham' : ''}`}
                  />
                  <FieldError id="contact-message-error" text={state.errors?.message} />
                </div>

                {current.images && (
                  <div>
                    <label htmlFor="contact-images" className="input-label">
                      Photographs<span className="ml-2 normal-case tracking-normal text-ink-mute">optional, up to {CONTACT_IMAGES.max}</span>
                    </label>
                    <input
                      id="contact-images"
                      name="images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, CONTACT_IMAGES.max))}
                      className="block w-full border border-dashed border-ink-mute bg-paper-warm px-3 py-4 font-sans text-small text-ink-soft file:mr-4 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-sans file:text-small file:text-paper hover:file:bg-bensham"
                    />
                    {photos.length > 0 && (
                      <ul className="mt-2 font-sans text-xs text-ink-mute">
                        {photos.map((p) => (
                          <li key={p.name + p.size}>{p.name}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-1 font-sans text-xs text-ink-mute">
                      A clear photograph of the whole work, and of any signature or label, helps most.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-rule pt-5">
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-bensham px-5 py-3 font-sans text-small font-medium text-paper transition-colors duration-colour hover:bg-bensham-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {preparing ? 'Preparing photographs' : pending ? 'Sending' : 'Send message'}
                </button>
                <p className="font-sans text-xs text-ink-mute">Goes to Brian Rankin. Your details are used only to reply.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
