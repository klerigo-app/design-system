/**
 * Tokens the dark theme intentionally does not override: the vivid brand 500s,
 * the brand mark's fixed artwork colours, and the inner ramp steps no component
 * uses (they appear only in the token showcase story). Both the CSS dark-layer
 * test and the CSS↔JS parity test read this list, so there is one allowlist
 * rather than two that can disagree.
 *
 * Revisit an entry here the moment a component adopts that step.
 */
export const THEME_INVARIANT: ReadonlySet<string> = new Set([
  '--color-coral-500',
  '--color-sun-500',
  '--color-teal-500',
  '--color-coral-100',
  '--color-coral-300',
  '--color-coral-900',
  '--color-sun-100',
  '--color-sun-300',
  '--color-sun-900',
  '--color-teal-100',
  '--color-teal-300',
  '--color-teal-900',

  // The logo. Artwork rather than surfaces — a brand mark that recoloured
  // itself in dark would be a different mark. LogoMark reads these on both
  // platforms so neither hardcodes them.
  '--color-brand-mark-tile',
  '--color-brand-mark-ink',
  '--color-brand-mark-letter',
  '--color-brand-mark-dot',
])
