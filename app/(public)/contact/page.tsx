import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ContactDesk } from '@/components/ContactDesk'
import { facebook, facebookGroupHref, intro, topicBySlug, topics, type ContactTopic } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Write to Brian Rankin about Charlie Rogers: a question, a painting for the back catalogue, authentication advice, a story about Charlie, or a talk for your group.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ about?: string }>
}) {
  const { about } = await searchParams
  const initial: ContactTopic = (about && topicBySlug(about)?.slug) || 'question'

  return (
    <div className="mx-auto max-w-content px-6 pb-20 pt-12">
      <header className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-bensham">Contact</p>
          <h1 className="mt-4 font-serif text-display">Knock on the door</h1>
          <p className="mt-6 max-w-reading font-serif text-lead text-ink-soft">{intro}</p>
          <p className="mt-4 max-w-reading font-serif text-body text-ink-mute">
            Messages go to Brian Rankin, who compiled <cite>Pursued by Bulldozers</cite> and looks
            after Charlie&rsquo;s work and story.
          </p>
        </div>
        <figure className="lg:col-span-5">
          <Link href="/catalogue/four-doors-at-school-street-gateshead-1977" className="group block">
            <div className="border border-rule bg-mount p-3 sm:p-4">
              <Image
                src="/artwork/web/four-doors-at-school-street-gateshead-1977.jpg"
                width={1600}
                height={1216}
                alt="Four adjoining front doors in a brick terrace, green, red and brown, with worn stone steps."
                sizes="(min-width: 1024px) 30rem, 100vw"
                priority
                className="block h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 font-sans text-xs text-ink-mute transition-colors duration-colour group-hover:text-bensham">
              Four Doors at School Street, Gateshead, 1977. Oil on board
            </figcaption>
          </Link>
        </figure>
      </header>

      <div className="mt-16 lg:mt-24">
        <ContactDesk topics={topics} initial={initial} />
      </div>

      <section
        aria-labelledby="facebook-heading"
        className="mt-20 grid gap-8 bg-ink p-8 text-paper sm:p-10 lg:grid-cols-12 lg:items-center lg:p-14"
      >
        <div className="lg:col-span-8">
          <p className="font-sans text-xs uppercase tracking-eyebrow text-ochre">{facebook.title}</p>
          <h2 id="facebook-heading" className="mt-3 font-serif text-h1">
            The Charlie Rogers Fan Club
          </h2>
          <p className="mt-4 max-w-reading font-serif text-body-lg text-paper/80">{facebook.text}</p>
        </div>
        <div className="lg:col-span-4 lg:text-right">
          <a
            href={facebookGroupHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-paper px-5 py-3 font-sans text-small font-medium text-paper transition-colors duration-colour hover:bg-paper hover:text-ink"
          >
            Join the group on Facebook
            <span className="sr-only">(opens in a new tab)</span>
            <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
              <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
