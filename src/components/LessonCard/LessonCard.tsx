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
    <div className="rounded-[var(--radius-card)] bg-white border border-border shadow-elevated p-6 flex gap-5">
      <div
        className="w-[70px] h-[70px] rounded-[18px] flex items-center justify-center font-display font-semibold text-white text-[28px] shrink-0"
        style={{ background: `linear-gradient(135deg, ${colors.sun[500]}, ${colors.coral[500]})` }}
      >
        {number}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Chip variant={levelVariant}>{levelLabel}</Chip>
          <Chip variant="category">{categoryLabel}</Chip>
          <span className="text-[13px] text-muted ml-auto">{duration}</span>
        </div>
        <p className="font-display font-medium text-xl text-ink">{title}</p>
        <p className="font-body text-sm text-slate">{subtitle}</p>
        <div className="flex items-center gap-3 mt-1">
          <ProgressBar value={progress} max={progressMax} className="flex-1" />
          <span className="font-body text-[13px] text-slate whitespace-nowrap">
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
