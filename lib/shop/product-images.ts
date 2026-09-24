// Reconciling a listing's images against what the form sent.
//
// The previous version ran a loop of awaited writes and checked none of their
// results, then returned 200 regardless. A failure halfway through left some
// images saved, some not, and the admin showing a success message, which is the
// worst of the three possible outcomes because nobody goes looking.

import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { SHOP_BUCKET } from './utils'

export interface ImagePayload {
  id?: string
  storage_path: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the Supabase
// client is generic over a generated Database type this project does not
// generate, so the concrete row types are not available to name here.
type Client = SupabaseClient<any, 'public', any>

// Returns null on success, or a message describing the first failure.
export async function replaceProductImages(
  supabase: Client,
  productId: string,
  images: ImagePayload[],
): Promise<string | null> {
  const { data: current, error: readErr } = await supabase
    .from('charlie_product_images')
    .select('id, storage_path')
    .eq('product_id', productId)

  if (readErr) return readErr.message

  const rows = (current ?? []) as { id: string; storage_path: string }[]
  const keptIds = new Set(
    images.map((i) => i.id).filter((v): v is string => Boolean(v)),
  )
  const removed = rows.filter((r) => !keptIds.has(r.id))

  if (removed.length > 0) {
    const { error } = await supabase
      .from('charlie_product_images')
      .delete()
      .in('id', removed.map((r) => r.id))
    if (error) return error.message

    // Storage cleanup only after the rows are gone. A file left behind is
    // untidy; a row pointing at a deleted file is a broken image on the shop.
    // Bucket paths only: the seeded listings reference files under public/,
    // which are part of the repository and must never be deleted.
    const paths = removed
      .map((r) => r.storage_path)
      .filter((p) => !p.startsWith('/'))
    if (paths.length > 0) {
      await createSupabaseServiceClient().storage.from(SHOP_BUCKET).remove(paths)
    }
  }

  // Exactly one primary, and it is the first image. The form orders by
  // position, so trusting its is_primary flag would let two arrive set.
  const ordered = images.map((img, index) => ({
    ...img,
    display_order: index,
    is_primary: index === 0,
  }))

  for (const img of ordered) {
    if (img.id) {
      const { error } = await supabase
        .from('charlie_product_images')
        .update({
          alt_text: img.alt_text,
          display_order: img.display_order,
          is_primary: img.is_primary,
        })
        .eq('id', img.id)
      if (error) return error.message
    } else {
      const { error } = await supabase.from('charlie_product_images').insert({
        product_id: productId,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: img.is_primary,
      })
      if (error) return error.message
    }
  }

  return null
}
