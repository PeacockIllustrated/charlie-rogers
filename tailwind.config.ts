import type { Config } from 'tailwindcss'

// Tokens are the source of truth for the design system. See docs/DESIGN.md.
// No pure white, no pure black. Square corners and no shadows are house rules,
// enforced by simply not using rounded-* or shadow-* utilities.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EE',
        'paper-warm': '#F2EBDC',
        ink: '#1A1916',
        'ink-soft': '#44423D',
        'ink-mute': '#7A776E',
        rule: '#D9D2C0',
        bensham: '#7A1F1F',
        'bensham-deep': '#5E1414',
        slate: '#4A5B6E',
        ochre: '#B8842C',
        sage: '#8B9B7A',
        brick: '#A85842',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // Modular scale, 1.25. See docs/DESIGN.md.
      fontSize: {
        'display-1': ['3.815rem', { lineHeight: '1.15' }],
        'display-2': ['3.052rem', { lineHeight: '1.15' }],
        h1: ['2.441rem', { lineHeight: '1.25' }],
        h2: ['1.953rem', { lineHeight: '1.25' }],
        h3: ['1.563rem', { lineHeight: '1.25' }],
        h4: ['1.25rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.55' }],
        body: ['1rem', { lineHeight: '1.55' }],
        small: ['0.875rem', { lineHeight: '1.4' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        eyebrow: '0.15em',
      },
      maxWidth: {
        content: '72rem',
        reading: '38rem',
      },
    },
  },
  plugins: [],
}

export default config
