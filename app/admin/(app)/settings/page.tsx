import { createSupabaseServerClient } from '@/lib/supabase/server'
import { canStoreOrders } from '@/lib/shop/orders'
import { penceToPounds } from '@/lib/shop/product-input'
import { SettingsForm } from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('charlie_shop_settings')
    .select('checkout_mode, uk_postage_pence, order_notify_email, updated_at')
    .eq('id', true)
    .maybeSingle()

  const row = data as {
    checkout_mode: string
    uk_postage_pence: number | null
    order_notify_email: string | null
    updated_at: string
  } | null

  // Things only the hosting environment can change. Shown as yes or no, never
  // the values: two of them are secrets.
  const environment = [
    { label: 'Orders can be saved', ok: canStoreOrders(), fix: 'Set SUPABASE_SERVICE_ROLE_KEY in the hosting environment.' },
    {
      label: 'Order emails can be sent',
      ok: Boolean(process.env.RESEND_API_KEY && process.env.SHOP_EMAIL_FROM),
      fix: 'Set RESEND_API_KEY and SHOP_EMAIL_FROM in the hosting environment.',
    },
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-h1">Settings</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          How the shop takes orders. Changes apply as soon as they are saved.
        </p>
      </div>

      {error || !row ? (
        <div role="alert" className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          The settings table is not in the database yet. Apply the migration
          20261006150000_charlie-shop-orders.sql, then reload this page.
          {error && <span className="mt-1 block text-ink-mute">{error.message}</span>}
        </div>
      ) : (
        <div className="border border-rule bg-paper p-6">
          <SettingsForm
            initial={{
              checkoutMode: row.checkout_mode,
              postage: row.uk_postage_pence === null ? '' : penceToPounds(row.uk_postage_pence),
              notifyEmail: row.order_notify_email ?? '',
            }}
          />
          <p className="mt-6 font-sans text-xs text-ink-mute">
            Last changed{' '}
            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(row.updated_at))}
            .
          </p>
        </div>
      )}

      <section>
        <h2 className="input-label">Set by the hosting environment</h2>
        <ul className="mt-2 divide-y divide-rule border border-rule bg-paper">
          {environment.map((item) => (
            <li key={item.label} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 font-sans text-small">
              <span className="text-ink">{item.label}</span>
              <span className={item.ok ? 'text-ink-soft' : 'text-bensham'}>{item.ok ? 'Yes' : `No. ${item.fix}`}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
