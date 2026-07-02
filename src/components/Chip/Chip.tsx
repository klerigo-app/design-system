import { type HTMLAttributes, type ReactNode } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export type ChipVariant = 'level' | 'category' | 'new' | 'completed' | 'live' | 'dark' | 'outline'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant: ChipVariant
  children: ReactNode
}

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  level: 'bg-teal-50 text-teal-700',
  category: 'bg-coral-50 text-coral-700',
  new: 'bg-sun-50 text-sun-700',
  completed: 'bg-[#EAF6EF] text-[#2E8B54]',
  live: 'bg-coral-500 text-white',
  dark: 'bg-ink text-white',
  outline: 'bg-transparent text-slate border-[1.5px] border-border-input',
}

export function Chip({ variant, className, children, ...props }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-[14px] py-[7px] text-[13px] font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {variant === 'completed' && <CheckIcon weight="bold" className="w-3.5 h-3.5" />}
      {variant === 'live' && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-white" />}
      {children}
    </span>
  )
}
