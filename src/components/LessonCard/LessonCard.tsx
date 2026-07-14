import { type ReactNode } from 'react'
import { Chip, type ChipVariant } from '../Chip/Chip'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { Button } from '../Button/Button'
import { colors } from '../../tokens/tokens'

export interface LessonCardProps {
  number: number
  levelLabel: string
  levelVariant?: ChipVariant
  categoryLabel: string
  duration: string
  title: string
  subtitle: string
  progress: number
  progressMax: number
  actionLabel: string
  onAction?: () => void
  actionSlot?: ReactNode
}

export function LessonCard({
  number,
  levelLabel,
  levelVariant = 'level',
  categoryLabel,
  duration,
  title,
  subtitle,
  progress,
  progressMax,
  actionLabel,
  onAction,
  actionSlot,
}: LessonCardProps) {
  return (
    <div className="flex gap-5 rounded-[var(--radius-card)] border border-border bg-surface-raised p-6 shadow-elevated">
      <div
        className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[18px] font-display text-[28px] font-semibold text-white"
        style={{ background: `linear-gradient(135deg, ${colors.sun[500]}, ${colors.coral[500]})` }}
      >
        {number}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Chip variant={levelVariant}>{levelLabel}</Chip>
          <Chip variant="category">{categoryLabel}</Chip>
          <span className="ml-auto text-[13px] text-muted">{duration}</span>
        </div>
        <p className="font-display text-xl font-medium text-ink">{title}</p>
        <p className="font-body text-sm text-slate">{subtitle}</p>
        <div className="mt-1 flex items-center gap-3">
          <ProgressBar value={progress} max={progressMax} className="flex-1" />
          <span className="whitespace-nowrap font-body text-[13px] text-slate">
            {progress} / {progressMax}
          </span>
          {actionSlot ?? (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
