import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ENQUIRY_COLUMNS, ENQUIRY_STATUS_LABELS, type Enquiry, type EnquiryStatus } from '@/lib/shop/enquiries'
import { cn } from '@/lib/shop/utils'
import { setEnquiryStatus } from './actions'

export const dynamic = 'force-dynamic'

const FILTERS: Array<{ value: EnquiryStatus | 'all'; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
]

const ACTIONS: Record<EnquiryStatus, Array<{ status: EnquiryStatus; label: string }>> = {
  new: [
    { status: 'replied', label: 'Mark replied' },
    { status: 'closed', label: 'Close' },
  ],
  replied: [
    { status: 'closed', label: 'Close' },
    { status: 'new', label: 'Back to new' },
  ],
  closed: [{ status: 'new', label: 'Reopen' }],
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  // New first: those are the ones with somebody waiting for an answer.
  const filter = FILTERS.find((f) => f.value === status)?.value ?? 'new'

  const supabase = await createSupabaseServerClient()
  let query = supabase.from('charlie_enquiries').select(ENQUIRY_COLUMNS).order('created_at', { ascending: false }).limit(200)
  if (filter !== 'all') query = query.eq('status', filter)
  const { data, error } = await query
  const enquiries = (data as Enquiry[] | null) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-h1">Enquiries</h1>
        <p className="mt-1 font-sans text-small text-ink-mute">
          Sent from the product pages, newest first. Reply by email, then mark it replied.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'new' ? '/admin/enquiries' : `/admin/enquiries?status=${f.value}`}
            className={cn(
              'border px-3 py-1.5 font-sans text-xs uppercase tracking-eyebrow transition-colors',
              filter === f.value ? 'border-bensham bg-bensham text-paper' : 'border-rule text-ink-soft hover:bg-paper-warm',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <div role="alert" className="border border-bensham/30 bg-bensham/5 px-4 py-3 font-sans text-small text-bensham">
          Could not load enquiries. If the enquiries migration
          (20261012090000_charlie-shop-enquiries.sql) has not been applied yet, apply it and reload.
          <span className="mt-1 block text-ink-mute">{error.message}</span>
        </div>
      )}

      {!error && enquiries.length === 0 ? (
        <div className="border border-rule bg-paper p-10">
          <p className="font-serif text-h3">{filter === 'new' ? 'Nothing waiting for a reply' : 'No enquiries here'}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {enquiries.map((q) => (
            <li key={q.id} className="border border-rule bg-paper p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-serif text-h4">
                  <a href={`/shop/${q.product_slug}`} target="_blank" rel="noreferrer" className="hover:text-bensham">
                    {q.product_title}
                  </a>
                  <span className="ml-3 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                    {ENQUIRY_STATUS_LABELS[q.status]}
                  </span>
                </p>
                <p className="font-sans text-small text-ink-mute">
                  {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(q.created_at))}
                </p>
              </div>

              <div className="mt-3 font-sans text-small text-ink-soft">
                <span className="text-ink">{q.name}</span>
                {', '}
                <a
                  href={`mailto:${q.email}?subject=${encodeURIComponent(`Re: ${q.product_title}`)}`}
                  className="underline underline-offset-4 hover:text-bensham"
                >
                  {q.email}
                </a>
                {q.phone && `, ${q.phone}`}
              </div>

              <p className="mt-4 border-l-2 border-rule pl-3 font-serif text-body text-ink-soft whitespace-pre-wrap">{q.message}</p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4">
                {ACTIONS[q.status].map((a, i) => (
                  <form key={a.status} action={setEnquiryStatus}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="status" value={a.status} />
                    <button type="submit" className={i === 0 ? 'btn-admin' : 'btn-admin-outline'}>
                      {a.label}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
