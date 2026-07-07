import type { ReactElement } from 'react'
import { LogoMark, type LogoMarkVariant } from './LogoMark'

export type LogoOrientation = 'horizontal' | 'stacked'

export interface LogoProps {
  variant?: LogoMarkVariant
  orientation?: LogoOrientation
  markSize?: number
  className?: string
}

const WORDMARK_COLOR: Record<LogoMarkVariant, string> = {
  coral: '#1F2933',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

export function Logo({
  variant = 'coral',
  orientation = 'horizontal',
  markSize = 40,
  className,
}: LogoProps): ReactElement {
  const isStacked = orientation === 'stacked'
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isStacked ? 'column' : 'row',
        alignItems: 'center',
        gap: isStacked ? 8 : 12,
      }}
    >
      <LogoMark size={markSize} variant={variant} />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: markSize * 0.46,
          color: WORDMARK_COLOR[variant],
          whiteSpace: 'nowrap',
        }}
      >
        Klerigo
      </span>
    </div>
  )
}
