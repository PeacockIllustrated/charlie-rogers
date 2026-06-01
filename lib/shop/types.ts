// Types for the shop, matching the charlie_ prefixed Supabase schema.
// See supabase/migrations for the source of truth.

export type ProductType = 'book' | 'print' | 'original' | 'other'
export type ProductStatus = 'draft' | 'published' | 'sold' | 'archived'

export interface ShopProduct {
  id: string
  title: string
  slug: string
  description: string | null
  price_pence: number
  product_type: ProductType
  status: ProductStatus
  medium: string | null
  dimensions: string | null
  year_text: string | null
  edition: string | null
  stock_count: number
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  // Joined relation, populated by queries.
  images?: ShopProductImage[]
}

export interface ShopProductImage {
  id: string
  product_id: string
  storage_path: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
  created_at: string
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  book: 'Book',
  print: 'Fine art print',
  original: 'Original painting',
  other: 'Other',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  sold: 'Sold',
  archived: 'Archived',
}
