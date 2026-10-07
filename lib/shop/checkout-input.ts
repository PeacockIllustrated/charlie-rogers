// Validation for the checkout form. Pure, like product-input.ts, so the form
// and the server action share one set of rules and the tests need nothing but
// node. The server action is the boundary; the browser's own `required`
// attributes are a courtesy.
//
// Delivery is UK only. Nothing Brian Rankin has sent mentions overseas postage,
// and a UK postcode check catches most typing slips.

export interface ShippingAddress {
  line1: string
  line2: string | null
  town: string
  county: string | null
  postcode: string
  country: 'United Kingdom'
}

export interface CheckoutDetails {
  name: string
  email: string
  phone: string | null
  address: ShippingAddress
  notes: string | null
}

export type CheckoutField =
  | 'name'
  | 'email'
  | 'phone'
  | 'line1'
  | 'line2'
  | 'town'
  | 'county'
  | 'postcode'
  | 'notes'

export type CheckoutErrors = Partial<Record<CheckoutField, string>>

const LIMITS: Record<CheckoutField, number> = {
  name: 120,
  email: 254,
  phone: 30,
  line1: 120,
  line2: 120,
  town: 80,
  county: 80,
  postcode: 10,
  notes: 1000,
}

// Loose on purpose: it accepts every real UK postcode shape, including BFPO
// and Girobank, and rejects things that are plainly not a postcode.
const UK_POSTCODE = /^(GIR ?0AA|BFPO ?\d{1,4}|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/

// One @, something either side, a dot in the domain. Deliverability is proved
// by the confirmation email, not by a regular expression.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Format a postcode the way Royal Mail prints it: upper case, one space
// before the inward code.
export function normalisePostcode(raw: string): string {
  const compact = raw.toUpperCase().replace(/\s+/g, '')
  if (compact.startsWith('BFPO')) return `BFPO ${compact.slice(4)}`
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact
}

function text(form: Record<string, unknown>, key: CheckoutField): string {
  const v = form[key]
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''
}

export function validateCheckoutDetails(
  form: Record<string, unknown>,
): { ok: true; details: CheckoutDetails } | { ok: false; errors: CheckoutErrors } {
  const errors: CheckoutErrors = {}
  const values = {} as Record<CheckoutField, string>

  for (const key of Object.keys(LIMITS) as CheckoutField[]) {
    // Notes keep their line breaks; everything else is one line.
    const raw = form[key]
    values[key] =
      key === 'notes' && typeof raw === 'string' ? raw.trim() : text(form, key)
    if (values[key].length > LIMITS[key]) {
      errors[key] = `Please keep this under ${LIMITS[key]} characters.`
    }
  }

  if (!values.name) errors.name = 'Please enter your name.'
  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!EMAIL.test(values.email)) errors.email = 'This does not look like an email address.'
  if (values.phone && !/^[+\d][\d\s()-]{5,}$/.test(values.phone)) {
    errors.phone = 'Please use digits, spaces and a leading plus only.'
  }
  if (!values.line1) errors.line1 = 'Please enter the first line of the address.'
  if (!values.town) errors.town = 'Please enter the town or city.'

  const postcode = normalisePostcode(values.postcode)
  if (!values.postcode) errors.postcode = 'Please enter a postcode.'
  else if (!UK_POSTCODE.test(postcode)) {
    errors.postcode = 'Please enter a UK postcode. We can only post within the UK for now.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    details: {
      name: values.name,
      email: values.email.toLowerCase(),
      phone: values.phone || null,
      address: {
        line1: values.line1,
        line2: values.line2 || null,
        town: values.town,
        county: values.county || null,
        postcode,
        country: 'United Kingdom',
      },
      notes: values.notes || null,
    },
  }
}
