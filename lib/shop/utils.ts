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
export function shopImageUrl(
  storagePath: string | null | undefined,
): string | null {
  if (!storagePath) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${SHOP_BUCKET}/${storagePath}`
}
