import { Eyebrow } from './Eyebrow'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto max-w-content px-6 py-12 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="font-serif italic text-xl">Charlie Rogers</div>
          <p className="font-serif text-body text-ink-soft mt-2 max-w-reading">
            Self-taught Gateshead painter, 1930 to 2020. He documented the back
            lanes, pubs and churches of Tyneside, often days before the
            bulldozers arrived.
          </p>
        </div>
        <div className="sm:text-right">
          <Eyebrow rule={false}>Pursued by Bulldozers</Eyebrow>
          <p className="font-sans text-small text-ink-mute mt-2">
            Built around the book by Brian Rankin, Littlecroft Publishing, 2025.
          </p>
          <p className="font-sans text-xs text-ink-mute mt-4">
            Artwork &copy; Charles Rogers Junior
          </p>
        </div>
      </div>
    </footer>
  )
}
