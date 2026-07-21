import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPalette, getShadows, type Palette, type ShadowValue } from './tokens'
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

const lightBlock = parseDecls(css.match(/:root\s*\{([^{}]*)\}/)![1])
const darkBlock = parseDecls(css.match(/:root\[data-theme=['"]dark['"]\]\s*\{([^{}]*)\}/)![1])

const lightCss = colorDecls(lightBlock)
const darkCss = colorDecls(darkBlock)

/**
 * Shadow tokens live under two prefixes, not one: lift/pressed/card/device are
 * `--shadow-*`, while the focus rings are `--focus-ring-*`. Both map onto the
 * same JS `Shadows` object, so both are collected here.
 */
const shadowDecls = (block: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(block).filter(
      ([name]) => name.startsWith('--shadow-') || name.startsWith('--focus-ring-'),
    ),
  )

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

/** `--shadow-button-lift-coral` -> `buttonLiftCoral`; `--focus-ring-teal` -> `focusRingTeal`. */
const shadowKey = (cssName: string) =>
  camel(cssName.startsWith('--shadow-') ? cssName.slice('--shadow-'.length) : cssName.slice(2))

/**
 * Parse a CSS box-shadow into the structured form tokens.ts stores. Handles the
 * three shapes in use: three lengths + hex, four lengths + hex, four lengths +
 * rgba(). Spread is absent in the three-length form and defaults to 0, matching
 * CSS. Colour is matched from the end because rgba() contains its own spaces.
 */
function parseShadow(value: string): ShadowValue {
  const m = value.match(/^(.*?)\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))\s*$/i)
  if (!m) throw new Error(`unparseable box-shadow: ${value}`)
  const lengths = m[1].trim().split(/\s+/).map(parseFloat)
  if (lengths.length < 3 || lengths.length > 4 || lengths.some(Number.isNaN)) {
    throw new Error(`unexpected box-shadow lengths in: ${value}`)
  }
  const [offsetX, offsetY, blurRadius, spreadDistance = 0] = lengths
  return { offsetX, offsetY, blurRadius, spreadDistance, color: m[2] }
}

const normalise = (s: ShadowValue): ShadowValue => ({ ...s, color: s.color.toLowerCase() })

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

// The shadow scale had the same hole the palette did before #8: tokens.ts was
// light-only AND an incomplete subset — tokens.css declared the two `pressed`
// variants that tokens.ts simply did not have, and nothing failed. These cover
// both directions so that cannot recur.
describe('getShadows mirrors tokens.css', () => {
  const lightShadowCss = shadowDecls(lightBlock)
  const darkShadowCss = shadowDecls(darkBlock)

  it('finds the shadow declarations it is meant to compare', () => {
    // Guards the guard: an empty parse passes every assertion below.
    expect(Object.keys(lightShadowCss).length).toBeGreaterThanOrEqual(8)
    expect(Object.keys(darkShadowCss)).toHaveLength(Object.keys(lightShadowCss).length)
  })

  it('covers every shadow token the stylesheet declares, and no others', () => {
    const cssKeys = Object.keys(lightShadowCss).map(shadowKey).sort()
    expect(Object.keys(getShadows('light')).sort()).toEqual(cssKeys)
  })

  for (const scheme of ['light', 'dark'] as const) {
    it(`matches every ${scheme} value`, () => {
      const shadows = getShadows(scheme) as unknown as Record<string, ShadowValue>
      const block = scheme === 'dark' ? darkShadowCss : lightShadowCss
      const mismatched = Object.entries(block)
        .filter(([name, value]) => {
          const js = shadows[shadowKey(name)]
          return !js || JSON.stringify(normalise(js)) !== JSON.stringify(parseShadow(value))
        })
        .map(([name, value]) => `${name}: css ${value} vs js ${JSON.stringify(shadows[shadowKey(name)])}`)
      expect(mismatched).toEqual([])
    })
  }

  it('flips every shadow between the two schemes', () => {
    // Unlike colours there are no invariants here: every shadow in this scale is
    // a coloured lift or ring, and all of them are tuned per scheme.
    const [lightS, darkS] = [getShadows('light'), getShadows('dark')]
    const unflipped = Object.keys(lightS).filter(
      (key) =>
        (lightS as unknown as Record<string, ShadowValue>)[key].color ===
        (darkS as unknown as Record<string, ShadowValue>)[key].color,
    )
    expect(unflipped).toEqual([])
  })
})
