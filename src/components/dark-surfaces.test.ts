import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Guards the dark-mode component fix: surfaces that were hardcoded (bg-white /
// bg-ink) must resolve through themeable tokens so they flip in dark mode.
// Light values of the new tokens equal the old hardcoded colors, so light mode
// is unchanged. See docs/superpowers/specs/2026-07-14-dark-mode-tokens-design.md.

const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')

// file -> token classes it must now use.
const mustContain: Record<string, string[]> = {
  'src/components/Card/Card.tsx': ['bg-surface-raised', 'bg-surface-inverse'],
  'src/components/Button/Button.tsx': ['bg-surface-raised'],
  'src/internal/field.tsx': ['bg-surface-raised'],
  'src/components/QuizCard/AnswerOption.tsx': ['bg-surface-raised'],
  'src/components/LessonCard/LessonCard.tsx': ['bg-surface-raised'],
  'src/components/FaqAccordion/FaqAccordion.tsx': ['bg-surface-raised'],
  'src/components/Modal/Modal.tsx': ['bg-surface-raised', 'bg-scrim'],
  'src/components/Toast/Toast.tsx': ['bg-surface-raised'],
  'src/components/MultiSelect/MultiSelect.tsx': ['bg-surface-raised'],
  'src/components/UnitPath/UnitPath.tsx': ['bg-surface-raised'],
  'src/components/Chip/Chip.tsx': ['bg-surface-inverse'],
  'src/components/StreakCard/StreakCard.tsx': ['bg-surface-inverse', 'text-surface-inverse'],
}

// Files whose surfaces are fully tokenized (no bare bg-white / bg-ink left).
// Chip and StreakCard intentionally keep decorative bg-white(/opacity) marks.
const fullyTokenized = [
  'src/components/Card/Card.tsx',
  'src/components/Button/Button.tsx',
  'src/internal/field.tsx',
  'src/components/QuizCard/AnswerOption.tsx',
  'src/components/LessonCard/LessonCard.tsx',
  'src/components/FaqAccordion/FaqAccordion.tsx',
  'src/components/Modal/Modal.tsx',
  'src/components/Toast/Toast.tsx',
  'src/components/MultiSelect/MultiSelect.tsx',
  'src/components/UnitPath/UnitPath.tsx',
]

describe('dark-mode surfaces are tokenized', () => {
  for (const [file, tokens] of Object.entries(mustContain)) {
    it(`${file} uses ${tokens.join(', ')}`, () => {
      const src = read(file)
      for (const token of tokens) expect(src).toContain(token)
    })
  }

  for (const file of fullyTokenized) {
    it(`${file} has no hardcoded surface color`, () => {
      const src = read(file)
      expect(src).not.toMatch(/\bbg-white\b/)
      expect(src).not.toMatch(/\bbg-ink\b/)
    })
  }
})

// Components that build inline gradient strings (which Tailwind cannot express)
// must interpolate CSS custom properties, not JS token values. The JS palette is
// light-only, so a baked-in hex freezes that element in light mode — this is how
// UnitPath's locked connector and ProgressRing's track were silently broken.
const inlineGradientComponents = [
  'src/components/ProgressRing/ProgressRing.tsx',
  'src/components/StreakCard/StreakCard.tsx',
  'src/components/LessonCard/LessonCard.tsx',
  'src/components/UnitPath/UnitPath.tsx',
]

describe('web components do not bake colors into inline styles', () => {
  for (const file of inlineGradientComponents) {
    it(`${file} builds gradients from CSS custom properties`, () => {
      const src = read(file)
      expect(src).toContain('var(--color-')
      expect(src).not.toMatch(/from '.*tokens\/tokens'/)
    })
  }

  // Applies to every web component, including ones with no gradient today.
  it('no web component imports the JS palette', () => {
    const components = readdirSync(resolve(process.cwd(), 'src/components'), {
      recursive: true,
      encoding: 'utf8',
    })
      .filter((name) => name.endsWith('.tsx') && !name.endsWith('.stories.tsx'))
      .map((name) => `src/components/${name}`)
    // Guards the guard: a listing that matches nothing passes vacuously.
    expect(components.length).toBeGreaterThan(20)

    const offenders = components.filter((file) => /from\s+'[^']*tokens\/tokens'/.test(read(file)))
    expect(offenders).toEqual([])
  })
})
