import { SectionHeading } from '@/components/SectionHeading'
import { Button } from '@/components/Button'

// Shared body for both not-found boundaries: app/not-found.tsx catches URLs
// that match no route at all, app/(public)/not-found.tsx catches notFound()
// raised inside a public page, such as an unknown shop slug. Both show this,
// so a mistyped address looks like the rest of the site rather than the stock
// Next.js page.
export function NotFoundPanel() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <SectionHeading
        as="h1"
        eyebrow="Not found"
        title="This page does not exist"
        intro="The address may have been mistyped, or the page may have been moved since it was last linked. The archive is still here."
      />

      <div className="mt-10 flex flex-wrap gap-4">
        <Button href="/">Return to the home page</Button>
        <Button href="/work" variant="secondary">
          Browse the paintings
        </Button>
        <Button href="/book" variant="tertiary">
          Read about the book
        </Button>
      </div>
    </div>
  )
}
