/**
 * Centralized Font Family Constants & Typography Utility Classes
 */
export const FONTS = {
  sans: 'var(--font-sans)',
  heading: 'var(--font-heading)',
  mono: 'font-mono',
} as const

export const TYPOGRAPHY_CLASSES = {
  h1: 'font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground',
  h2: 'font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground',
  h3: 'font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground',
  h4: 'font-heading text-lg font-bold tracking-tight text-foreground',
  body: 'font-sans text-sm text-foreground leading-relaxed',
  caption: 'font-sans text-xs text-muted-foreground',
  label: 'font-sans text-xs font-semibold text-foreground tracking-wide uppercase',
  mono: 'font-mono text-xs text-muted-foreground',
} as const

export default {
  FONTS,
  TYPOGRAPHY_CLASSES,
}
