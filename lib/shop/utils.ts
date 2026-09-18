// Shop helpers. The storage bucket holds product images uploaded via the admin.

export const SHOP_BUCKET = 'charlie-shop-images'

// Join className parts; like clsx but zero-dependency.
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}

// Format pence as a GBP string, e.g. 2500 -> "£25.00".
export function formatPence(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}

// Public storage URL for a product image path. Null when unset or no env.
// A path beginning with a slash is a local file under public/ and is returned
// as is, which is how the local catalogue serves images before Supabase exists.
export function shopImageUrl(
  storagePath: string | null | undefined,
): string | null {
  if (!storagePath) return null
  if (storagePath.startsWith('/')) return storagePath
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${SHOP_BUCKET}/${storagePath}`
}

// Brian Rankin has priced only the book and the greeting cards. Every painting
// is still TBC, and no price has been invented, so zero means unpriced rather
// than free.
export function formatPrice(pence: number): string {
  return pence > 0 ? formatPence(pence) : 'Price on application'
}
