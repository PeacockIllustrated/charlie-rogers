'use server'

import { SITE_URL } from '@/lib/site'
import { validateEnquiry, type EnquiryErrors } from '@/lib/shop/enquiry-input'
import { saveEnquiry } from '@/lib/shop/enquiries'
import { canStoreOrders } from '@/lib/shop/orders'
import { fetchProductsBySlugs } from '@/lib/shop/products'
import { notifyShopOfEnquiry } from '@/lib/shop/notify'
import { getShopSettings } from '@/lib/shop/settings'

export interface EnquiryState {
  sent?: boolean
  errors?: EnquiryErrors
  // A sentence for the top of the form, when the problem is not one field.
  message?: string
  // Echoed back so a failed submission does not empty the form.
  values?: Record<string, string>
}

const FIELDS = ['name', 'email', 'phone', 'message'] as const

// Send an enquiry about one product to the admins: saved to
// charlie_enquiries for /admin/enquiries, and emailed to the address in
// Settings when the environment can send email.
//
// The product is looked up again by slug, so the title stored is the shop's
// own and an enquiry cannot be filed against something that is not listed.
export async function sendEnquiryAction(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const values: Record<string, string> = {}
  for (const f of FIELDS) {
    const v = formData.get(f)
    values[f] = typeof v === 'string' ? v : ''
  }

  // A field people never see. Anything that fills it in is a script, and is
  // told it worked so it has no reason to try again.
  if (String(formData.get('website') ?? '') !== '') return { sent: true }

  if (!canStoreOrders()) {
    console.error('[shop] enquiry form shown but SUPABASE_SERVICE_ROLE_KEY is not set')
    return { values, message: 'Enquiries cannot be sent from this version of the site.' }
  }

  const checked = validateEnquiry(values)
  if (!checked.ok) return { values, errors: checked.errors, message: 'Please check the highlighted details.' }

  const slug = String(formData.get('slug') ?? '')
  const [product] = /^[a-z0-9-]{1,200}$/.test(slug) ? await fetchProductsBySlugs([slug]) : []
  if (!product) return { values, message: 'This item is no longer listed, so the enquiry was not sent.' }

  const saved = await saveEnquiry({ product, details: checked.details })
  if (!saved.ok) {
    return {
      values,
      message:
        saved.reason === 'rate'
          ? 'Several enquiries have already come from this address in the last hour. Please try again later.'
          : 'Your enquiry could not be sent just now. Please try again in a few minutes.',
    }
  }

  const settings = await getShopSettings()
  await notifyShopOfEnquiry(
    settings.orderNotifyEmail,
    { productTitle: product.title, productSlug: product.slug, adminUrl: `${SITE_URL}/admin/enquiries` },
    checked.details,
  )

  return { sent: true }
}
