import type { ShopProductOption } from '@/lib/shop/types'
import { penceToPounds } from '@/lib/shop/product-input'
import { addPrintEditions, saveProductOption } from './options-actions'

// The editions a print is sold in. Each has its own price and stock: the
// standard print is made to order (stock left blank), the limited edition
// counts down from fifty as orders are placed, and comes back up if an order
// is cancelled.
export function EditionsPanel({
  productId,
  options,
  isPrint,
}: {
  productId: string
  options: ShopProductOption[]
  isPrint: boolean
}) {
  const sorted = [...options].sort((a, b) => a.display_order - b.display_order)
  if (sorted.length === 0 && !isPrint) return null

  return (
    <section id="editions" className="border border-rule bg-paper p-6">
      <h2 className="font-serif text-h3">Editions</h2>
      <p className="mt-2 max-w-reading font-sans text-small text-ink-soft">
        What customers choose between when they order this print. Leave stock
        blank for made to order. The listing price above is only the
        &ldquo;From&rdquo; figure shown in the shop.
      </p>

      {sorted.length === 0 ? (
        <form action={addPrintEditions} className="mt-5">
          <input type="hidden" name="product_id" value={productId} />
          <p className="mb-3 font-sans text-small text-ink-soft">
            This print has no editions yet, so it cannot be ordered online.
          </p>
          <button type="submit" className="btn-admin">
            Add the standard and limited editions
          </button>
        </form>
      ) : (
        <ul className="mt-5 divide-y divide-rule border-y border-rule">
          {sorted.map((o) => (
            <li key={o.id} className="py-4">
              <form action={saveProductOption} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="product_id" value={productId} />
                <input type="hidden" name="id" value={o.id} />
                <div className="min-w-[12rem] flex-1">
                  <p className="font-serif text-body text-ink">{o.name}</p>
                  {o.detail && <p className="font-sans text-xs text-ink-mute">{o.detail}</p>}
                </div>
                <div>
                  <label htmlFor={`price-${o.id}`} className="input-label">
                    Price, £
                  </label>
                  <input id={`price-${o.id}`} name="price" inputMode="decimal" defaultValue={penceToPounds(o.price_pence)} className="input w-28" />
                </div>
                <div>
                  <label htmlFor={`stock-${o.id}`} className="input-label">
                    Stock
                  </label>
                  <input
                    id={`stock-${o.id}`}
                    name="stock"
                    inputMode="numeric"
                    defaultValue={o.stock_count === null ? '' : String(o.stock_count)}
                    placeholder="Made to order"
                    className="input w-32"
                  />
                </div>
                <label className="flex items-center gap-2 pb-2 font-sans text-small text-ink-soft">
                  <input type="checkbox" name="is_active" defaultChecked={o.is_active} />
                  Offered
                </label>
                <button type="submit" className="btn-admin-outline">
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
