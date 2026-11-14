import { randomUUID } from 'node:crypto'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { CONTACT_IMAGES } from '@/lib/contact'
import type { EnquiryDetails } from '@/lib/shop/enquiry-input'

// Server only. Contact page messages are kept beside the shop enquiries in
// charlie_enquiries, so the admins see them at /admin/enquiries and the same
// rate limit applies, and photographs go to a private bucket. Both are
// optional: the email to Brian is the message, so it still goes when the
// database or the bucket cannot be reached.

export const CONTACT_BUCKET = 'charlie-contact'

// A year, so Brian can open a photograph from an old email.
const LINK_SECONDS = 365 * 24 * 60 * 60

const MAX_PER_EMAIL_PER_HOUR = 5

export function canStoreContact(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function tooManyFrom(email: string): Promise<boolean> {
  if (!canStoreContact()) return false
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error } = await createSupabaseServiceClient()
    .from('charlie_enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', since)
  if (error) {
    console.error('[contact] rate check failed:', error.message)
    return false
  }
  return (count ?? 0) >= MAX_PER_EMAIL_PER_HOUR
}

export async function recordContact(input: {
  topic: string
  topicLabel: string
  details: EnquiryDetails
  images: string[]
}): Promise<void> {
  if (!canStoreContact()) return
  const photos = input.images.length > 0 ? `\n\nPhotographs:\n${input.images.join('\n')}` : ''
  const { error } = await createSupabaseServiceClient()
    .from('charlie_enquiries')
    .insert({
      product_id: null,
      product_slug: `contact-${input.topic}`,
      product_title: `Contact page: ${input.topicLabel}`,
      name: input.details.name,
      email: input.details.email,
      phone: input.details.phone,
      // The table keeps 2000 characters; the email to Brian has the lot.
      message: (input.details.message + photos).slice(0, 2000),
    })
  if (error) console.error('[contact] saving the message failed:', error.message)
}

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// Checks the bytes as well as the declared type, so a renamed file is not
// stored as a photograph.
function looksLikeImage(buf: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (type === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  if (type === 'image/webp')
    return String.fromCharCode(...buf.slice(0, 4)) === 'RIFF' && String.fromCharCode(...buf.slice(8, 12)) === 'WEBP'
  return false
}

// Store each photograph and return a signed link to it. Anything that is not
// a small image, or that fails to store, is counted rather than sent.
export async function storeContactImages(files: File[]): Promise<{ links: string[]; failed: number }> {
  const wanted = files.filter((f) => f.size > 0).slice(0, CONTACT_IMAGES.max)
  if (wanted.length === 0) return { links: [], failed: 0 }
  if (!canStoreContact()) return { links: [], failed: wanted.length }

  const storage = createSupabaseServiceClient().storage.from(CONTACT_BUCKET)
  const day = new Date().toISOString().slice(0, 10)
  const links: string[] = []
  let failed = 0
  for (const file of wanted) {
    const type = file.type
    if (!(CONTACT_IMAGES.types as readonly string[]).includes(type) || file.size > CONTACT_IMAGES.maxBytes) {
      failed++
      continue
    }
    const buf = new Uint8Array(await file.arrayBuffer())
    if (!looksLikeImage(buf, type)) {
      failed++
      continue
    }
    const path = `${day}/${randomUUID()}.${EXT[type]}`
    const up = await storage.upload(path, buf, { contentType: type, upsert: false })
    if (up.error) {
      console.error('[contact] photograph upload failed:', up.error.message)
      failed++
      continue
    }
    const signed = await storage.createSignedUrl(path, LINK_SECONDS)
    if (signed.error || !signed.data) {
      console.error('[contact] photograph link failed:', signed.error?.message)
      failed++
      continue
    }
    links.push(signed.data.signedUrl)
  }
  return { links, failed }
}
