import type { ReactElement } from 'react'
import { LETTER_K_PATH } from './glyphPaths'

export type LogoMarkVariant = 'coral' | 'knockout' | 'outline'

export interface LogoMarkProps {
  size?: number
  variant?: LogoMarkVariant
  className?: string
}

const TILE_FILL: Record<LogoMarkVariant, string> = {
  coral: '#F14E3A',
  knockout: '#1F2933',
  outline: 'none',
}

const LETTER_FILL: Record<LogoMarkVariant, string> = {
  coral: '#FFFFFF',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

const OUTLINE_STROKE_COLOR = '#1F2933'
const SUN_DOT_FILL = '#FFC23C'

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
          stroke={OUTLINE_STROKE_COLOR}
          strokeWidth={8}
        />
      ) : (
        <rect width={512} height={512} rx={132} fill={TILE_FILL[variant]} />
      )}
      {/* Real Baloo 2 bold 'K' glyph outline (see scripts/extract-glyph-paths.mjs),
          matching the wordmark's typeface/weight rather than a hand-drawn shape. */}
      <path d={LETTER_K_PATH} fill={LETTER_FILL[variant]} />
      <circle cx={382} cy={140} r={30} fill={SUN_DOT_FILL} />
    </svg>
  )
}
