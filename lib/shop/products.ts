import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { CATALOGUE } from './catalogue'
import type { ShopProduct } from './types'

// Look up the products in a basket. Same source rules as the shop pages: the
// live tables when Supabase is configured, the local catalogue otherwise, and
// the local catalogue with a log line if the query fails.
export async function fetchProductsBySlugs(slugs: string[]): Promise<ShopProduct[]> {
  if (slugs.length === 0) return []
  const local = () => CATALOGUE.filter((p) => slugs.includes(p.slug))
  if (!isSupabaseConfigured()) return local()

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('charlie_products')
    .select('*, images:charlie_product_images(*)')
    .in('slug', slugs)
    .in('status', ['published', 'sold'])

  if (error) {
    console.error('[shop] basket product query failed, using local catalogue:', error.message)
    return local()
  }
  return (data as ShopProduct[] | null) ?? []
}
