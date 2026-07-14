import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The dark theme lives entirely in tokens.css as custom-property overrides.
// These tests parse the stylesheet as text (no DOM) and assert the dark layer
// is present, complete, and internally consistent. Read raw source from disk —
// a `?raw` import is Tailwind-processed under Vitest, not the authored source.
// See docs/superpowers/specs/2026-07-14-dark-mode-tokens-design.md.

const css = readFileSync(resolve(process.cwd(), 'src/tokens/tokens.css'), 'utf8')

/** Extract `--name: value` declarations from a CSS block body. */
function parseDecls(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[`--${m[1]}`] = m[2].trim()
  }
  return out
}

/** The light base block: the first plain `:root { … }` (not :root:not / :root[…]). */
function baseBlock(): Record<string, string> {
  const m = css.match(/:root\s*\{([^{}]*)\}/)
  if (!m) throw new Error('base :root block not found')
  return parseDecls(m[1])
}

/** The `@media (prefers-color-scheme: dark)` dark block, guarded by :not([data-theme=light]). */
function mediaDarkBlock(): Record<string, string> | null {
  const m = css.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme=['"]light['"]\]\)\s*\{([^{}]*)\}\s*\}/,
  )
  return m ? parseDecls(m[1]) : null
}

/** The explicit `:root[data-theme="dark"]` block. */
function attrDarkBlock(): Record<string, string> | null {
  const m = css.match(/:root\[data-theme=['"]dark['"]\]\s*\{([^{}]*)\}/)
  return m ? parseDecls(m[1]) : null
}

// Tokens intentionally NOT re-declared in dark: geometry, the vivid brand 500s,
// and the inner ramp steps no component uses (only shown in the token showcase).
const THEME_INVARIANT = new Set([
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
])

const isThemeable = (name: string) =>
  name.startsWith('--color-') || name.startsWith('--shadow-') || name.startsWith('--focus-ring-')

describe('dark theme tokens', () => {
  it('declares both activation blocks (media default + data-theme override)', () => {
    expect(mediaDarkBlock()).toBeTruthy()
    expect(attrDarkBlock()).toBeTruthy()
  })

  it('overrides every themeable base token except the intentional invariants', () => {
    const dark = attrDarkBlock() ?? {}
    const missing = Object.keys(baseBlock())
      .filter(isThemeable)
      .filter((name) => !THEME_INVARIANT.has(name))
      .filter((name) => !(name in dark))
    expect(missing).toEqual([])
  })

  it('does not re-declare the theme-invariant tokens in dark', () => {
    const dark = attrDarkBlock() ?? {}
    const leaked = [...THEME_INVARIANT].filter((name) => name in dark)
    expect(leaked).toEqual([])
  })

  it('keeps the two dark blocks byte-identical (no drift)', () => {
    expect(mediaDarkBlock()).toEqual(attrDarkBlock())
  })

  it('matches the TutorConsole anchor values verbatim', () => {
    const dark = attrDarkBlock() ?? {}
    expect(dark['--color-paper']).toBe('#181310')
    expect(dark['--color-ink']).toBe('#f4efe7')
    expect(dark['--color-teal-700']).toBe('#63cccc')
    expect(dark['--color-surface']).toBe('#241d18')
  })
})
