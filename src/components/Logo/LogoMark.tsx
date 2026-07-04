import type { ReactElement } from 'react'
import { LETTER_E_PATH, LETTER_L_PATH } from './glyphPaths'

const TILDE_PATH = 'M6 18 C 16 2, 30 2, 43 14 C 56 26, 70 26, 80 10'

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

const STROKE_COLOR: Record<LogoMarkVariant, string> = {
  coral: '#FFC23C',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

export function LogoMark({ size = 160, variant = 'coral', className }: LogoMarkProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="EspañoLenka" className={className}>
      {variant === 'outline' ? (
        <rect x={4} y={4} width={504} height={504} rx={130} fill="none" stroke={STROKE_COLOR.outline} strokeWidth={8} />
      ) : (
        <rect width={512} height={512} rx={132} fill={TILE_FILL[variant]} />
      )}
      <g
        transform="translate(161,104) scale(2.21)"
        fill="none"
        stroke={STROKE_COLOR[variant]}
        strokeWidth={11}
        strokeLinecap="round"
      >
        <path d={TILDE_PATH} />
      </g>
      <path d={LETTER_E_PATH} fill={LETTER_FILL[variant]} />
      <path d={LETTER_L_PATH} fill={LETTER_FILL[variant]} />
    </svg>
  )
}
