import { Button } from './Button'
import { Eyebrow } from './Eyebrow'

// Reinforces the commerce goal. Every editorial page closes by pointing readers
// to the book for the full account. Heritage first, but the book is for sale.
export function BookCallout({ text }: { text?: string }) {
  return (
    <aside className="mt-16 border-t border-rule pt-8 max-w-reading">
      <Eyebrow rule={false}>From the book</Eyebrow>
      <p className="font-serif text-body-lg mt-3">
        {text ??
          'This is a short account. The full story, with more than a hundred paintings, is told in Charlie Rogers, Pursued by Bulldozers.'}
      </p>
      <div className="mt-5">
        <Button href="/book">About the book</Button>
      </div>
    </aside>
  )
}
