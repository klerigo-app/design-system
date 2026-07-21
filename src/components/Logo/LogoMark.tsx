import type { ReactElement } from 'react'
import { LETTER_K_PATH } from './glyphPaths'

export type LogoMarkVariant = 'coral' | 'knockout' | 'outline'

export interface LogoMarkProps {
  size?: number
  variant?: LogoMarkVariant
  className?: string
}

/**
 * The mark's colours come from the `--color-brand-mark-*` tokens rather than
 * literals, so this file and its React Native twin cannot drift.
 *
 * They are read as CSS custom properties, not through `getPalette` — tokens.ts
 * says outright that web components style through the CSS layer and that the JS
 * palette exists for React Native. All four are in THEME_INVARIANT, so there is
 * no dark value to miss.
 *
 * Note the navy does two jobs: it is the knockout tile *and* the outline
 * variant's letter, where the other two variants use white.
 */
const MARK_TILE = 'var(--color-brand-mark-tile)'
const MARK_INK = 'var(--color-brand-mark-ink)'
const MARK_LETTER = 'var(--color-brand-mark-letter)'
const MARK_DOT = 'var(--color-brand-mark-dot)'

const TILE_FILL: Record<LogoMarkVariant, string> = {
  coral: MARK_TILE,
  knockout: MARK_INK,
  outline: 'none',
}

const LETTER_FILL: Record<LogoMarkVariant, string> = {
  coral: MARK_LETTER,
  knockout: MARK_LETTER,
  outline: MARK_INK,
}

export function LogoMark({
  size = 160,
  variant = 'coral',
  className,
}: LogoMarkProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Klerigo"
      className={className}
    >
      {variant === 'outline' ? (
        <rect
          x={4}
          y={4}
          width={504}
          height={504}
          rx={130}
          fill="none"
          stroke={MARK_INK}
          strokeWidth={8}
        />
      ) : (
        <rect width={512} height={512} rx={132} fill={TILE_FILL[variant]} />
      )}
      {/* Real Baloo 2 bold 'K' glyph outline (see scripts/extract-glyph-paths.mjs),
          matching the wordmark's typeface/weight rather than a hand-drawn shape. */}
      <path d={LETTER_K_PATH} fill={LETTER_FILL[variant]} />
      <circle cx={382} cy={140} r={30} fill={MARK_DOT} />
    </svg>
  )
}
