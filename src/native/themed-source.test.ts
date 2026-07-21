import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The bug this package shipped with was structural, not a typo: colours were
// read at module scope, so StyleSheet.create froze the light palette at import
// time and no amount of theme switching could move it. These are source-level
// guards, because a component can only be caught by a render test once someone
// remembers to write one — and #9/#10 add roughly ten more components here.

const files = readdirSync(resolve(process.cwd(), 'src/native'))
  .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
  .map((name) => `src/native/${name}`)

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8')

/**
 * Colours knowingly left unthemed, listed per file so the exception cannot
 * quietly grow. Native shadows need shadowColor/shadowOffset/elevation rather
 * than the CSS box-shadow strings the token layer carries, so a themed native
 * shadow scale is separate work — see the "out of scope" section of
 * docs/superpowers/specs/2026-07-21-native-dark-mode-design.md. Until then this
 * warm brown is correct on paper and too warm on a dark surface.
 */
const KNOWN_UNTHEMED: Record<string, Set<string>> = {
  'src/native/Toast.tsx': new Set(['#5A3C1E']),
}

describe('native components cannot freeze the palette', () => {
  it('finds the component files it is meant to guard', () => {
    // Guards the guard: a glob that matches nothing passes every test below.
    expect(files.length).toBeGreaterThanOrEqual(8)
  })

  for (const file of files) {
    if (file.endsWith('theme.tsx')) continue

    it(`${file} does not call StyleSheet.create directly`, () => {
      expect(read(file)).not.toContain('StyleSheet.create')
    })

    it(`${file} reads colours through the theme, not the token module`, () => {
      const src = read(file)
      // radiusValue and the types are fine — geometry does not flip.
      expect(src).not.toMatch(/import\s*\{[^}]*\bgetPalette\b[^}]*\}\s*from\s*'\.\.\/tokens/)
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
