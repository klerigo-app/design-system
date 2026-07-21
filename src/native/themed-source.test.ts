import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The bug this package shipped with was structural, not a typo: colours were
// read at module scope, so StyleSheet.create froze the light palette at import
// time and no amount of theme switching could move it. These are source-level
// guards, because a component can only be caught by a render test once someone
// remembers to write one — and #9/#10 add roughly ten more components here.

/**
 * Directories holding no component source. `__test__` is the react-native stub,
 * which is allowed everything this file forbids.
 */
const SKIP_DIRS = new Set(['__test__'])

/**
 * Walk `src/native` recursively.
 *
 * It used to be a flat `readdirSync`. #10 moved every component into its own
 * directory, which would have left this reading nothing but the barrels — the
 * guard would have passed while covering zero components.
 */
function collect(dir: string): string[] {
  return readdirSync(resolve(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return SKIP_DIRS.has(entry.name) ? [] : collect(`${dir}/${entry.name}`)
    }
    const isSource =
      entry.name.endsWith('.tsx') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.test-d.tsx')
    return isSource ? [`${dir}/${entry.name}`] : []
  })
}

const files = collect('src/native')

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8')

/**
 * Colours knowingly left unthemed, listed per file so the exception cannot
 * quietly grow.
 *
 * Empty as of #9. It previously held Toast's hardcoded `#5A3C1E` shadow, which
 * existed only because the token layer carried CSS box-shadow strings React
 * Native could not consume. #9 added `getShadows` and Toast now reads
 * `theme.shadows.cardElevated` like everything else.
 */
const KNOWN_UNTHEMED: Record<string, Set<string>> = {}

describe('native components cannot freeze the palette', () => {
  it('finds the component files it is meant to guard', () => {
    // Guards the guard: a walk that matches nothing passes every test below.
    // 13 after #9 added ButtonBase and the five new button variants; 27 after
    // #10's ten plus the option sheet and the control row. A floor, not an
    // equality — but it must rise whenever a batch lands, or a broken walk goes
    // unnoticed.
    expect(files.length).toBeGreaterThanOrEqual(27)
  })

  it('reaches into the per-component directories, not just the flat files', () => {
    // The specific failure the recursive walk exists to prevent: matching only
    // `src/native/*.tsx` still finds theme.tsx and would satisfy the floor above,
    // while covering no component at all. Every path below is nested.
    expect(files).toContain('src/native/Card/Card.tsx')
    expect(files).toContain('src/native/Button/ButtonBase.tsx')
    expect(files).toContain('src/native/internal/optionSheet.tsx')
  })

  for (const file of files) {
    if (file.endsWith('theme.tsx')) continue

    it(`${file} does not call StyleSheet.create directly`, () => {
      expect(read(file)).not.toContain('StyleSheet.create')
    })

    it(`${file} reads colours through the theme, not the token module`, () => {
      const src = read(file)
      // radiusValue and the types are fine — geometry does not flip.
      // `(\.\.\/)+` rather than a single `../`: from a component directory the
      // specifier is '../../tokens', which the one-level pattern silently
      // stopped matching, so this check passed vacuously for every new file.
      expect(src).not.toMatch(/import\s*\{[^}]*\bgetPalette\b[^}]*\}\s*from\s*'(\.\.\/)+tokens/)
    })

    it(`${file} has no hardcoded hex outside a saturated fill`, () => {
      const src = read(file)
      const hexes = [...src.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map((m) => m[0].toUpperCase())
      // White on a brand/semantic fill is the one sanctioned literal, per the
      // dark-mode conventions: those fills do not flip, so the label must not.
      const offenders = hexes.filter((hex) => hex !== '#FFFFFF' && !KNOWN_UNTHEMED[file]?.has(hex))
      expect(offenders).toEqual([])
    })
  }
})
