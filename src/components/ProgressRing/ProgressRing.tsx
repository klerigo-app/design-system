import type { ReactElement } from 'react'
import { colors } from '../../tokens/tokens'

export interface ProgressRingProps {
  percent: number
  size?: number
  label?: string
  caption?: string
}

export function ProgressRing({
  percent,
  size = 88,
  label,
  caption,
}: ProgressRingProps): ReactElement {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div
      role="img"
      aria-label={`${Math.round(pct)}% complete`}
      className="relative inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${colors.teal[500]} 0% ${pct}%, #E7EFEF ${pct}% 100%)`,
      }}
    >
      <div
        className="absolute rounded-full bg-surface flex flex-col items-center justify-center"
        style={{ width: size * 0.727, height: size * 0.727 }}
      >
        <span className="font-display font-semibold text-[22px] text-ink">
          {label ?? `${Math.round(pct)}%`}
        </span>
        {caption && <span className="text-[11px] text-slate">{caption}</span>}
      </div>
    </div>
  )
}
