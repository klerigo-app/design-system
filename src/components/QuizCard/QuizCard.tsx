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
  /** Shows a compact "←" button sharing the submit row (20% / 80% split) when
   * a step back is available — e.g. a linear runner where an earlier,
   * not-yet-revealed answer stays editable. Omit for the default single
   * full-width submit button. */
  onBack?: () => void
  backLabel?: string
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
  onBack,
  backLabel = 'Back',
}: QuizCardProps) {
  return (
    <Card variant="elevated" className="flex flex-col gap-5 !rounded-[var(--radius-card)]">
      <div className="flex items-center gap-3">
        <ProgressBar
          value={current}
          max={total}
          variant="xp-gradient"
          height={6}
          className="flex-1"
        />
        <span className="font-mono text-[13px] text-slate">
          {current}/{total}
        </span>
      </div>
      <div>
        <p className="mb-2 font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700">
          {promptLabel}
        </p>
        <p className="font-display text-2xl font-medium text-ink">{question}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      {onBack ? (
        <div className="flex gap-3">
          <div className="basis-1/5">
            <Button variant="secondary" fullWidth aria-label={backLabel} onClick={onBack}>
              ←
            </Button>
          </div>
          <div className="basis-4/5">
            <Button variant="primary" fullWidth onClick={onSubmit} disabled={submitDisabled}>
              {submitLabel}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="primary" fullWidth onClick={onSubmit} disabled={submitDisabled}>
          {submitLabel}
        </Button>
      )}
    </Card>
  )
}
