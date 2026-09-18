// Brian Rankin sent this on 11 June 2026 with the instruction "Please include
// this on the new website", and sent it again the same day. It is the printer's
// own description, from Paul Wright at the Biscuit.
//
// Reproduced as written, with one correction: Brian's email has "extreme
// temperature's", which is a plain typographical slip rather than a turn of
// phrase, so the apostrophe is dropped here. Everything else is his wording.
export function PrintSpecifications() {
  return (
    <section
      className="max-w-reading border-t border-rule pt-8"
      aria-labelledby="print-specifications"
    >
      {/* The eyebrow is the heading itself, rather than a span with a hidden
          heading beside it, so a screen reader announces it once. */}
      <h2
        id="print-specifications"
        className="mb-4 font-sans text-xs uppercase tracking-eyebrow text-bensham"
      >
        Print specifications
      </h2>

      <p className="font-serif text-body text-ink-soft">
        Each of our high quality prints is made using Archival Pigment (Giclée)
        Expression Smooth 300gsm Art Paper. We use professional-grade, archival
        pigment ink specifically designed for fine art printing.
      </p>

      <p className="mt-4 font-serif text-body text-ink-soft">
        Each print should be treated the same as an original painting. Prints
        purchased from this website should not be placed in rooms with extreme
        temperatures or direct sunlight.
      </p>

      <p className="mt-4 font-sans text-small text-ink-mute">
        Prints are supplied by fine art printer Paul Wright at the Biscuit.
      </p>
    </section>
  )
}
