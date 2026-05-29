import type { Metadata } from 'next'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/Button'
import { StatusLabel } from '@/components/StatusLabel'
import { PaintingCard } from '@/components/PaintingCard'

// Internal design review surface. Excluded from indexing; keep out of the
// production sitemap when that is built. See docs/ROADMAP.md, Phase 0.
export const metadata: Metadata = {
  title: 'Style guide',
  robots: { index: false, follow: false },
}

const palette = [
  { name: 'paper', hex: '#FAF6EE' },
  { name: 'paper-warm', hex: '#F2EBDC' },
  { name: 'ink', hex: '#1A1916' },
  { name: 'ink-soft', hex: '#44423D' },
  { name: 'ink-mute', hex: '#7A776E' },
  { name: 'rule', hex: '#D9D2C0' },
  { name: 'bensham', hex: '#7A1F1F' },
  { name: 'bensham-deep', hex: '#5E1414' },
  { name: 'slate', hex: '#4A5B6E' },
  { name: 'ochre', hex: '#B8842C' },
  { name: 'sage', hex: '#8B9B7A' },
  { name: 'brick', hex: '#A85842' },
]

const scale: { cls: string; label: string }[] = [
  { cls: 'text-display-1', label: 'display-1 · 61px' },
  { cls: 'text-display-2', label: 'display-2 · 49px' },
  { cls: 'text-h1', label: 'h1 · 39px' },
  { cls: 'text-h2', label: 'h2 · 31px' },
  { cls: 'text-h3', label: 'h3 · 25px' },
  { cls: 'text-h4 font-semibold', label: 'h4 · 20px' },
  { cls: 'text-body-lg', label: 'body-lg · 18px' },
  { cls: 'text-body', label: 'body · 16px' },
]

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <section className="py-12 border-t border-rule first:border-t-0">
      <Eyebrow rule={false}>{eyebrow}</Eyebrow>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function Styleguide() {
  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="font-serif text-h1">Style guide</h1>
      <p className="font-serif text-body text-ink-soft mt-2 max-w-reading">
        Internal review surface for the design system. Not indexed, not in the
        sitemap.
      </p>

      <Section eyebrow="Palette">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {palette.map((c) => (
            <div key={c.name}>
              <div
                className="h-20 border border-rule"
                style={{ backgroundColor: c.hex }}
              />
              <div className="font-sans text-small mt-2">{c.name}</div>
              <div className="font-sans text-xs text-ink-mute uppercase">
                {c.hex}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Type scale">
        <div className="space-y-4">
          {scale.map((s) => (
            <div key={s.cls} className="flex flex-col gap-1">
              <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
                {s.label}
              </span>
              <span className={`font-serif ${s.cls}`}>
                The things you never notice until they are gone
              </span>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              small · 14px · sans
            </span>
            <span className="font-sans text-small">
              Pen and wash on paper, 14 x 10 inches
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
              xs · 12px · sans, eyebrow tracking
            </span>
            <span className="font-sans text-xs uppercase tracking-eyebrow">
              Charlie Rogers · Gateshead
            </span>
          </div>
        </div>
      </Section>

      <Section eyebrow="Eyebrow and running head">
        <Eyebrow>Charlie Rogers · Bensham</Eyebrow>
      </Section>

      <Section eyebrow="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="tertiary">Tertiary link</Button>
        </div>
      </Section>

      <Section eyebrow="Status labels">
        <div className="flex flex-wrap gap-6">
          <StatusLabel status="extant" />
          <StatusLabel status="demolished" />
          <StatusLabel status="altered" />
          <StatusLabel status="unknown" />
        </div>
      </Section>

      <Section eyebrow="Painting card">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <PaintingCard
            src="/paintings/thumbs/page_027_img_000.jpg"
            title="Saltwell Park"
            location="Saltwell"
            medium="Watercolour"
            status="extant"
          />
          <PaintingCard
            src="/paintings/thumbs/page_027_img_006.jpg"
            title="Cotfield Street"
            location="Bensham"
            medium="Pen and wash"
            status="demolished"
          />
          <PaintingCard
            src="/paintings/thumbs/page_027_img_004.jpg"
            title="Gateshead Cenotaph"
            location="Shipcote"
            medium="Oil on board"
            status="extant"
          />
        </div>
      </Section>
    </div>
  )
}
