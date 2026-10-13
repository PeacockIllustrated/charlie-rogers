// Validation for the product enquiry form. Pure, like checkout-input.ts, so
// the form and the server action share one set of rules and the tests need
// nothing but node.

export interface EnquiryDetails {
  name: string
  email: string
  phone: string | null
  message: string
}

export type EnquiryField = 'name' | 'email' | 'phone' | 'message'

export type EnquiryErrors = Partial<Record<EnquiryField, string>>

export const ENQUIRY_LIMITS: Record<EnquiryField, number> = {
  name: 120,
  email: 254,
  phone: 30,
  message: 2000,
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEnquiry(
  form: Record<string, unknown>,
): { ok: true; details: EnquiryDetails } | { ok: false; errors: EnquiryErrors } {
  const errors: EnquiryErrors = {}
  const values = {} as Record<EnquiryField, string>

  for (const key of Object.keys(ENQUIRY_LIMITS) as EnquiryField[]) {
    const raw = form[key]
    const s = typeof raw === 'string' ? raw : ''
    // The message keeps its line breaks; everything else is one line.
    values[key] = key === 'message' ? s.trim() : s.trim().replace(/\s+/g, ' ')
    if (values[key].length > ENQUIRY_LIMITS[key]) {
      errors[key] = `Please keep this under ${ENQUIRY_LIMITS[key]} characters.`
    }
  }

  if (!values.name) errors.name = 'Please enter your name.'
  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!EMAIL.test(values.email)) errors.email = 'This does not look like an email address.'
  if (values.phone && !/^[+\d][\d\s()-]{5,}$/.test(values.phone)) {
    errors.phone = 'Please use digits, spaces and a leading plus only.'
  }
  if (!values.message) errors.message = 'Please say what you would like to know.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    details: {
      name: values.name,
      email: values.email.toLowerCase(),
      phone: values.phone || null,
      message: values.message,
    },
  }
}

// What the message box starts with, by product type. Gives the customer
// somewhere to begin without putting words in their mouth.
export function enquiryPrompt(productType: string): string {
  switch (productType) {
    case 'book':
      return 'For example, how many copies you would like and where they would be posted.'
    case 'other':
      return 'For example, how many you would like and where they would be posted.'
    case 'print':
      return 'For example, the standard print or the limited edition, how many you would like, and where they would be sent.'
    default:
      return 'For example, whether prints will be made of this painting, or anything you would like to know about it.'
  }
}
