import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number
  max?: number
  variant?: 'teal' | 'xp-gradient'
  height?: number
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'teal',
  height = 10,
  className,
  ...props
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('w-full overflow-hidden rounded-md bg-[#F1E7D2]', className)}
      style={{ height }}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-md transition-[width] duration-300 ease-out',
          variant === 'teal' ? 'bg-teal-500' : 'bg-gradient-to-r from-sun-300 to-sun-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
