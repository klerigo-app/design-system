import type { ReactElement } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentedControlOption {
  value: string
  label: string
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps): ReactElement {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-[3px] rounded-[16px] bg-segmented-track p-[3px]',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[14px] px-3 py-[6px] font-body text-[13px] font-bold transition-all duration-150',
              isActive ? 'bg-coral-500 text-white' : 'bg-transparent text-slate',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
