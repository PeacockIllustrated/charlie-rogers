'use server'

import { contactRecipient, topicBySlug } from '@/lib/contact'
import { recordContact, storeContactImages, tooManyFrom } from '@/lib/contact-store'
import { validateEnquiry, type EnquiryErrors } from '@/lib/shop/enquiry-input'
import { emailSetup, sendContactMessage } from '@/lib/shop/notify'

export interface ContactState {
  sent?: boolean
  // Photographs that were chosen but did not arrive.
  imagesFailed?: number
  errors?: EnquiryErrors & { topic?: string }
  message?: string
  values?: Record<string, string>
}

const FIELDS = ['topic', 'name', 'email', 'phone', 'message'] as const

// Send a contact page message to Brian Rankin by email, with any
// photographs as links, and keep a copy for the admins.
export async function sendContactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values: Record<string, string> = {}
  for (const f of FIELDS) {
    const v = formData.get(f)
    values[f] = typeof v === 'string' ? v : ''
  }

  // Hidden field; only a script fills it. It is told it worked.
  if (String(formData.get('website') ?? '') !== '') return { sent: true }

  const topic = topicBySlug(values.topic)
  const checked = validateEnquiry(values)
  if (!topic || !checked.ok) {
    return {
      values,
      errors: { ...(checked.ok ? {} : checked.errors), ...(topic ? {} : { topic: 'Please choose what your message is about.' }) },
      message: 'Please check the highlighted details.',
    }
  }

  if (!emailSetup().ok) {
    console.error('[contact] contact form used but email is not set up in the hosting environment')
    return { values, message: 'Messages cannot be sent from this version of the site just now. Please try again later.' }
  }

  if (await tooManyFrom(checked.details.email)) {
    return { values, message: 'Several messages have already come from this address in the last hour. Please try again later.' }
  }

  const files = topic.images
    ? formData.getAll('images').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f)
    : []
  const { links, failed } = await storeContactImages(files)

  const notSent = await sendContactMessage(contactRecipient(), {
    topicLabel: topic.label,
    text: checked.details.message,
    name: checked.details.name,
    email: checked.details.email,
    phone: checked.details.phone,
    images: links,
    imagesFailed: failed,
  })
  if (notSent) {
    return { values, message: 'Your message could not be sent just now. Please try again in a few minutes.' }
  }

  await recordContact({ topic: topic.slug, topicLabel: topic.label, details: checked.details, images: links })
  return { sent: true, imagesFailed: failed }
}
