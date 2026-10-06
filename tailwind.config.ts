import type { Config } from 'tailwindcss'

// Tokens are the source of truth for the design system. See docs/DESIGN.md.
// No pure white, no pure black. Square corners and no shadows are house rules,
// enforced by simply not using rounded-* or shadow-* utilities.
const config: Config = {
  // lib/ is scanned because class names live in content modules too, for
  // example kindDotClass in lib/content/timeline.ts. Leaving it out silently
  // dropped bg-slate from the build, so every "life" marker and the Life
  // swatch in the timeline legend rendered transparent. Tailwind never warns
  // about a class it was not asked to look for.
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Hex values are kept so Tailwind's opacity modifiers keep working. The
      // OKLCH equivalents, which the spec is written in, are in docs/DESIGN.md.
      colors: {
        paper: '#FAF6EE',
        'paper-warm': '#F2EBDC',
        // The mount board behind a painting. Paintings only, nothing else.
        mount: '#F4EEE2',
        ink: '#1A1916',
        'ink-soft': '#44423D',
        'ink-mute': '#6B6860',
        rule: '#D9D2C0',
        bensham: '#7A1F1F',
        'bensham-deep': '#5E1414',
        slate: '#4A5B6E',
        ochre: '#B8842C',
        sage: '#8B9B7A',
        brick: '#A85842',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Futura', 'Century Gothic', 'system-ui', 'sans-serif'],
      },
      // Seven sizes, hand-set, with tracking per band. See docs/DESIGN.md.
      // The legacy names map onto the ladder so older markup lands on a step:
      // display-2 and h1 share a size, as do h3 and lead, and h4, body-lg and
      // body are all the 19px reading size.
      fontSize: {
        display: [
          'clamp(3.25rem, 7.4vw, 5.5rem)',
          { lineHeight: '0.98', letterSpacing: '-0.02em' },
        ],
        'display-1': [
          'clamp(3.25rem, 7.4vw, 5.5rem)',
          { lineHeight: '0.98', letterSpacing: '-0.02em' },
        ],
        'display-2': [
          'clamp(2.375rem, 4.6vw, 3.0625rem)',
          { lineHeight: '1.08', letterSpacing: '-0.01em' },
        ],
        h1: [
          'clamp(2.375rem, 4.6vw, 3.0625rem)',
          { lineHeight: '1.08', letterSpacing: '-0.01em' },
        ],
        h2: ['1.9375rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        h3: ['1.4375rem', { lineHeight: '1.3' }],
        lead: ['1.4375rem', { lineHeight: '1.42' }],
        h4: ['1.1875rem', { lineHeight: '1.35' }],
        'body-lg': ['1.1875rem', { lineHeight: '1.6' }],
        body: ['1.1875rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.45', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        eyebrow: '0.16em',
      },
      maxWidth: {
        content: '76rem',
        reading: '38rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.7,.2,1)',
        standard: 'cubic-bezier(.4,0,.2,1)',
      },
      transitionDuration: {
        colour: '120ms',
        fade: '220ms',
        sheet: '360ms',
      },
    },
  },
  plugins: [],
}

export default config
