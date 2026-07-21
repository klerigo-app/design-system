import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPalette, type Palette } from './tokens'
import { THEME_INVARIANT } from './themeInvariant'

// tokens.css and tokens.ts are both hand-authored (see the 2026-07-14 spec for
// why neither generates the other). This test is what keeps them honest: the JS
// palette React Native reads must carry the same values the web CSS layer does,
// in both themes. Read raw source from disk — a `?raw` import is
// Tailwind-processed under Vitest, not the authored source.
const css = readFileSync(resolve(process.cwd(), 'src/tokens/tokens.css'), 'utf8')

function parseDecls(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[`--${m[1]}`] = m[2].trim()
  }
  return out
}

const colorDecls = (block: Record<string, string>) =>
  Object.fromEntries(Object.entries(block).filter(([name]) => name.startsWith('--color-')))

const lightCss = colorDecls(parseDecls(css.match(/:root\s*\{([^{}]*)\}/)![1]))
const darkCss = colorDecls(
  parseDecls(css.match(/:root\[data-theme=['"]dark['"]\]\s*\{([^{}]*)\}/)![1]),
)

/**
 * Map a CSS custom-property name to the value it should equal in the JS
 * palette. Purely structural — `--color-coral-500` is a ramp step,
 * `--color-border-input` camel-cases to `borderInput` — so adding a token needs
 * no lookup table here, only the entry in tokens.css and tokens.ts.
 * Returns undefined when the JS palette has no such key at all.
 */
function paletteValue(palette: Palette, cssName: string): string | undefined {
  const key = cssName.replace('--color-', '')

  const ramp = key.match(/^(coral|sun|teal)-(\d+)$/)
  if (ramp) {
    const steps = palette[ramp[1] as 'coral' | 'sun' | 'teal'] as Record<string, string>
    return steps[ramp[2]]
  }

  const camel = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return (palette as unknown as Record<string, string | object>)[camel] as string | undefined
}

/** Every `--color-*` name, flattened back out of the JS palette shape. */
function paletteCssNames(palette: Palette): string[] {
  const names: string[] = []
  for (const [key, value] of Object.entries(palette)) {
    const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    if (typeof value === 'string') {
      names.push(`--color-${kebab}`)
    } else {
      for (const step of Object.keys(value)) names.push(`--color-${kebab}-${step}`)
    }
  }
  return names
}

const eq = (a: string | undefined, b: string | undefined) => a?.toLowerCase() === b?.toLowerCase()

describe('tokens.ts mirrors tokens.css', () => {
  it('covers every --color-* token the light :root block declares', () => {
    const palette = getPalette('light')
    const missing = Object.keys(lightCss).filter((name) => !paletteValue(palette, name))
    expect(missing).toEqual([])
  })

  it('declares no colour the stylesheet does not have', () => {
    const extra = paletteCssNames(getPalette('light')).filter((name) => !(name in lightCss))
    expect(extra).toEqual([])
  })

  it('matches every light value', () => {
    const palette = getPalette('light')
    const mismatched = Object.entries(lightCss)
      .filter(([name, value]) => !eq(paletteValue(palette, name), value))
      .map(([name, value]) => `${name}: css ${value} vs js ${paletteValue(palette, name)}`)
    expect(mismatched).toEqual([])
  })

  it('matches every dark value the dark block overrides', () => {
    const palette = getPalette('dark')
    const mismatched = Object.entries(darkCss)
      .filter(([name, value]) => !eq(paletteValue(palette, name), value))
      .map(([name, value]) => `${name}: css ${value} vs js ${paletteValue(palette, name)}`)
    expect(mismatched).toEqual([])
  })

  // The CSS dark layer omits the invariants rather than restating them, but the
  // JS dark palette is fully resolved, so those keys must hold the light value.
  // This is what lets a native component read palette.coral[500] without
  // knowing whether that particular token flips.
  it('resolves theme-invariant tokens to their light value in dark', () => {
    const palette = getPalette('dark')
    const wrong = [...THEME_INVARIANT]
      .filter((name) => !eq(paletteValue(palette, name), lightCss[name]))
      .map(
        (name) => `${name}: expected light ${lightCss[name]}, got ${paletteValue(palette, name)}`,
      )
    expect(wrong).toEqual([])
  })

  it('leaves nothing but the invariants unflipped between the two palettes', () => {
    const [lightPalette, darkPalette] = [getPalette('light'), getPalette('dark')]
    const unflipped = paletteCssNames(lightPalette)
      .filter((name) => eq(paletteValue(lightPalette, name), paletteValue(darkPalette, name)))
      .filter((name) => !THEME_INVARIANT.has(name))
    expect(unflipped).toEqual([])
  })
})
