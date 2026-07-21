import type { ReactElement } from 'react'

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
        // Custom properties, not JS token values: a gradient string is baked at
        // render time and would freeze the light palette. #E7EFEF here was the
        // locked-connector colour, which does flip in dark.
        background: `conic-gradient(var(--color-teal-500) 0% ${pct}%, var(--color-connector-locked) ${pct}% 100%)`,
      }}
    >
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-surface"
        style={{ width: size * 0.727, height: size * 0.727 }}
      >
        <span className="font-display text-[22px] font-semibold text-ink">
          {label ?? `${Math.round(pct)}%`}
        </span>
        {caption && <span className="text-[11px] text-slate">{caption}</span>}
      </div>
    </div>
  )
}
