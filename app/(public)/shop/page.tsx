import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Frame } from '@/components/Frame'
import { ProductCard } from '@/components/shop/ProductCard'
import { PrintSpecifications } from '@/components/shop/PrintSpecifications'
import { GalleryVisit } from '@/components/GalleryVisit'
import { gallery, galleryAddress } from '@/lib/content/gallery'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { CATALOGUE } from '@/lib/shop/catalogue'
import type { ShopProduct } from '@/lib/shop/types'
import { isCheckoutOpen } from '@/lib/shop/checkout-open'
import { PRINT_EDITIONS, PRINT_SIZE } from '@/lib/shop/prints'
import { formatPence, shopImageUrl } from '@/lib/shop/utils'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Pursued by Bulldozers, the special edition of the book about Charlie Rogers, with greeting cards and fine art prints of his paintings of Gateshead and Newcastle.',
  alternates: { canonical: '/shop' },
}

// The copy depends on whether the checkout is open, which an admin can
// change at any time.
export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  let products: ShopProduct[] = []
  const open = await isCheckoutOpen()

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('charlie_products')
      .select('*, images:charlie_product_images(*), options:charlie_product_options(*)')
      .in('status', ['published', 'sold'])
      .order('is_featured', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) {
      // Swallowing this silently turns any outage, bad key or policy change
      // into an empty shop that looks deliberate. Say so in the logs, and show
      // the local catalogue rather than an "opening soon" panel that is not
      // true. Found while testing against the live database from a host whose
      // egress policy blocked supabase.co: the page looked fine and was wrong.
      console.error('[shop] product query failed, using local catalogue:', error.message)
      products = [...CATALOGUE]
    } else {
      products = (data as ShopProduct[] | null) ?? []
    }
  } else {
    // No database yet, so fall back to the local catalogue. This exists so the
    // shop can be reviewed before Supabase is pointed at; the live tables win
    // the moment they are configured.
    products = [...CATALOGUE].sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured),
    )
  }

  const book = products.find((p) => p.product_type === 'book') ?? null
  const prints = products.filter((p) => p.product_type === 'print')
  const cards = products.filter((p) => p.product_type === 'other')
  const originals = products.filter((p) => p.product_type === 'original')
  // The picture that hangs in the opening: Bensham Road, 1970, the painting
  // the home page leads with, or failing that the first print with a photo.
  const feature =
    prints.find((p) => p.slug.startsWith('bensham-road')) ?? prints.find((p) => p.images?.length) ?? null
  const featureImage = feature ? primaryImage(feature) : null
  const bookImage = book ? primaryImage(book) : null
  const sections = [
    { id: 'prints', label: 'Fine art prints', count: prints.length },
    { id: 'book', label: 'The book', count: book ? 1 : 0 },
    { id: 'cards', label: 'Greeting cards', count: cards.length },
    { id: 'originals', label: 'Original paintings', count: originals.length },
  ].filter((s) => s.count > 0)

  return (
    <div>
      {/* The opening: a red gallery wall with one print hung on it. */}
      <section className="bg-bensham text-paper">
        <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="lg:col-span-6">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-paper/75">Charlie Rogers, the shop</p>
            <h1 className="mt-4 font-serif text-display">Shop</h1>
            <p className="mt-6 max-w-[34rem] font-serif text-lead text-paper/90">
              Fine art prints of Charlie’s paintings, the signed special edition of the book, and greeting cards.
              {open ? ' Everything here can be ordered online.' : ' Order by enquiry, or through the gallery in Gateshead.'}
            </p>
            <dl className="mt-10 grid max-w-[36rem] grid-cols-1 border-t border-paper/30 sm:grid-cols-3">
              {[
                ['Prints', `From ${formatPence(PRINT_EDITIONS[0].price_pence)}, delivered free`],
                ['Limited editions', 'Fifty of each, with a certificate'],
                ['The book', 'Signed, 100 copies'],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-paper/30 py-4 sm:border-b-0 sm:pr-4">
                  <dt className="font-sans text-xs uppercase tracking-eyebrow text-paper/70">{k}</dt>
                  <dd className="mt-1 font-serif text-body text-paper">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="#prints" className="inline-block bg-paper px-5 py-3 font-sans text-small font-medium text-bensham transition-colors hover:bg-paper-warm">
                See the prints
              </Link>
              {book && (
                <Link href="#book" className="inline-block border border-paper/60 px-5 py-3 font-sans text-small font-medium text-paper transition-colors hover:bg-paper hover:text-bensham">
                  The book
                </Link>
              )}
            </div>
          </div>

          {feature && featureImage && (
            <Link href={`/shop/${feature.slug}`} className="group lg:col-span-6 lg:justify-self-end">
              <figure className="flex flex-col items-center">
                <Frame size="lg" className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transform-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featureImage.url} alt={featureImage.alt} className="!w-auto max-h-[22rem] max-w-full sm:max-h-[26rem]" />
                </Frame>
                {/* The gallery label beside the hung picture. */}
                <figcaption className="mt-6 w-full max-w-[22rem] border-l-2 border-paper/60 pl-4">
                  <span className="block font-serif text-h4 text-paper group-hover:underline group-hover:underline-offset-4">{feature.title}</span>
                  <span className="mt-1 block font-sans text-xs text-paper/75">
                    {[feature.year_text, feature.medium].filter(Boolean).join(', ')}. Print, {PRINT_SIZE}
                  </span>
                </figcaption>
              </figure>
            </Link>
          )}
        </div>
      </section>

      {/* Brian Rankin, 23 October 2026: until the shop takes orders online,
          customers order through his gallery, so how to reach it leads the
          shop, as one line under the hero. The full gallery block, with its
          photograph, follows the products, so the pictures for sale are not
          pushed a phone's length down the page. */}
      {!open && (
        <div className="border-b border-rule bg-paper-warm">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-6 py-5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8">
            <p className="min-w-0 font-serif text-body text-ink lg:flex-1">
              <span className="mb-1 block font-sans text-xs uppercase tracking-eyebrow text-bensham lg:mb-0 lg:mr-4 lg:inline">Order through the gallery</span>
              {gallery.name}, {galleryAddress}
            </p>
            <p className="flex flex-wrap gap-x-6 gap-y-1 font-serif text-body lg:shrink-0 lg:flex-nowrap">
              <a href={gallery.phoneHref} className="whitespace-nowrap tabular-nums text-bensham underline underline-offset-4 hover:text-bensham-deep">
                {gallery.phone}
              </a>
              <a href={`mailto:${gallery.email}`} className="break-all text-bensham underline underline-offset-4 hover:text-bensham-deep">
                {gallery.email}
              </a>
            </p>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="mx-auto max-w-content px-6 py-16">
          <div className="max-w-reading border border-rule bg-paper p-6 sm:p-8">
            <h2 className="font-serif text-h3">The shop is opening soon</h2>
            <p className="mt-3 font-serif text-body text-ink-soft">
              The first listings are being photographed and written up. In the
              meantime, the book is available to read about, and the full
              archive of paintings is free to browse.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/book">Read about the book</Button>
              <Button href="/work" variant="secondary">
                Browse the paintings
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Contents, so a visitor can go straight to what they came for. */}
          <nav aria-label="Shop sections" className="border-b border-rule">
            <ul className="mx-auto flex max-w-content flex-wrap gap-x-8 gap-y-2 px-6 py-5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="font-sans text-xs uppercase tracking-eyebrow text-ink-soft transition-colors hover:text-bensham">
                    {s.label}
                    {s.count > 1 && <span className="ml-2 text-ink-mute">{s.count}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {prints.length > 0 && (
            <section id="prints" aria-labelledby="prints-heading" className="scroll-mt-24">
              <div className="mx-auto max-w-content px-6 pt-16 lg:pt-20">
                <div className="grid gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Fine art prints</p>
                    <h2 id="prints-heading" className="mt-4 font-serif text-h1">Charlie’s paintings, for your wall</h2>
                    <p className="mt-5 max-w-reading font-serif text-body text-ink-soft">
                      Every print is {PRINT_SIZE}, made by Paul Wright at the Biscuit Factory from scans of the
                      original paintings, and embossed with the Charlie Rogers blind stamp. Delivered free.
                    </p>
                  </div>
                  {/* The two editions, side by side, as a choice. */}
                  <dl className="grid grid-cols-1 self-end border-t border-ink sm:grid-cols-2 lg:col-span-6">
                    {PRINT_EDITIONS.map((e) => (
                      <div key={e.code} className="border-b border-rule py-5 sm:pr-6 sm:[&:nth-child(2)]:border-l sm:[&:nth-child(2)]:pl-6">
                        <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">{e.name}</dt>
                        <dd className="mt-2 font-serif text-h2 text-bensham">{formatPence(e.price_pence)}</dd>
                        <dd className="mt-1 font-serif text-small text-ink-soft">{e.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* grid-cols-1 rather than the implicit column: an implicit
                    column sizes to its widest content, and iPhone Safari counts
                    a painting's full pixel width there, which pushed the cards
                    off the right of the screen (Brian's screenshot, 12 October
                    2026). */}
                <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
                  {prints.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {book && (
            <section id="book" aria-labelledby="book-heading" className="mt-20 scroll-mt-24 border-y border-rule bg-paper-warm">
              <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:py-20">
                <Link href={`/shop/${book.slug}`} className="frame-wall group flex items-center justify-center p-8 sm:p-12 lg:col-span-6">
                  {bookImage ? (
                    <Frame className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transform-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bookImage.url} alt={bookImage.alt} className="!w-auto max-h-[24rem] max-w-full" />
                    </Frame>
                  ) : (
                    <span className="font-serif text-h2 italic text-bensham">Pursued by Bulldozers</span>
                  )}
                </Link>
                <div className="lg:col-span-6">
                  <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">The book</p>
                  <h2 id="book-heading" className="mt-4 font-serif text-h1">{book.title}</h2>
                  <p className="mt-5 max-w-reading font-serif text-body text-ink-soft">
                    Charlie’s life and work, compiled by Brian Rankin and published by Littlecroft in 2025. This edition is
                    exclusive to this website: 100 copies, each embossed with the Charlie Rogers emblem and signed by
                    the author.
                  </p>
                  <p className="mt-6 font-serif text-h2 text-ink">{formatPence(book.price_pence)}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={`/shop/${book.slug}`}>{open ? 'Order the book' : 'Ask about the book'}</Button>
                    <Button href="/book" variant="secondary">
                      About the book
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {cards.length > 0 && (
            <section id="cards" aria-labelledby="cards-heading" className="scroll-mt-24">
              <div className="mx-auto max-w-content px-6 pt-16 lg:pt-20">
                <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Greeting cards</p>
                <h2 id="cards-heading" className="mt-4 font-serif text-h1">Cards for Christmas</h2>
                <p className="mt-5 max-w-reading font-serif text-body text-ink-soft">
                  Five of Charlie’s snow scenes and street views, each stamped with the official Charlie Rogers
                  logo. As a pack of five, or one at a time.
                </p>
                <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
                  {cards.map((p) => (
                    <ProductCard key={p.id} product={p} size="sm" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {originals.length > 0 && (
            <section id="originals" aria-labelledby="originals-heading" className="scroll-mt-24">
              <div className="mx-auto max-w-content px-6 pt-16 lg:pt-20">
                <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Original paintings</p>
                <h2 id="originals-heading" className="mt-4 font-serif text-h1">The paintings themselves</h2>
                <p className="mt-5 max-w-reading font-serif text-body text-ink-soft">By enquiry only.</p>
                <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
                  {originals.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Brian asked for the printer's specification to appear on the site. */}
      {prints.length > 0 && (
        <div className="mx-auto max-w-content px-6 pt-20">
          <PrintSpecifications />
        </div>
      )}

      <div className="mx-auto max-w-content px-6 pt-16">
        <GalleryVisit id="shop-gallery" />
      </div>
    </div>
  )
}

function primaryImage(p: ShopProduct): { url: string; alt: string } | null {
  const img = p.images?.find((i) => i.is_primary) ?? p.images?.[0] ?? null
  const url = img ? shopImageUrl(img.storage_path) : null
  return img && url ? { url, alt: img.alt_text ?? p.title } : null
}
