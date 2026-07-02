import { type ReactNode } from 'react'
import { Card } from '../Card/Card'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { Button } from '../Button/Button'

export interface QuizCardProps {
  current: number
  total: number
  promptLabel: string
  question: ReactNode
  children: ReactNode
  onSubmit?: () => void
  submitLabel: string
  submitDisabled?: boolean
}

export function QuizCard({
  current,
  total,
  promptLabel,
  question,
  children,
  onSubmit,
  submitLabel,
  submitDisabled,
}: QuizCardProps) {
  return (
    <Card variant="elevated" className="!rounded-[var(--radius-card)] flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={current} max={total} variant="xp-gradient" height={6} className="flex-1" />
        <span className="font-mono text-[13px] text-slate">
          {current}/{total}
        </span>
      </div>
      <div>
        <p className="font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700 mb-2">
          {promptLabel}
        </p>
        <p className="font-display font-medium text-2xl text-ink">{question}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <Button variant="primary" fullWidth onClick={onSubmit} disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </Card>
  )
}
