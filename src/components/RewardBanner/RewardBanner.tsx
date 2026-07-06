import type { ReactElement } from 'react'
import { CheckIcon } from '@phosphor-icons/react'

export interface RewardBannerProps {
  title: string
  subtitle: string
}

export function RewardBanner({ title, subtitle }: RewardBannerProps): ReactElement {
  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-success-border bg-success-tint p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success">
        <CheckIcon weight="bold" className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="font-display text-lg font-medium text-ink">{title}</p>
        <p className="text-sm text-success-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}
