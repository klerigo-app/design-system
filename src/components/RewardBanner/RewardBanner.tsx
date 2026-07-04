import type { ReactElement } from 'react'
import { CheckIcon } from '@phosphor-icons/react'

export interface RewardBannerProps {
  title: string
  subtitle: string
}

export function RewardBanner({ title, subtitle }: RewardBannerProps): ReactElement {
  return (
    <div className="rounded-[18px] bg-[#EAF6EF] border border-[#C9E8D5] p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center shrink-0">
        <CheckIcon weight="bold" className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-display font-medium text-lg text-ink">{title}</p>
        <p className="text-sm text-[#3E7C58]">{subtitle}</p>
      </div>
    </div>
  )
}
