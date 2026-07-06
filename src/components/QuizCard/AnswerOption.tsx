import { type ReactNode } from 'react'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'

export type AnswerOptionStatus = 'default' | 'selected' | 'correct' | 'wrong'

export interface AnswerOptionProps {
  status?: AnswerOptionStatus
  onSelect?: () => void
  children: ReactNode
}

const STATUS_CLASSES: Record<AnswerOptionStatus, string> = {
  default: 'border-border-input bg-white hover:border-teal-500 hover:bg-[#F3FAFA]',
  selected: 'border-teal-500 bg-[#F3FAFA]',
  correct: 'border-success bg-[#EAF6EF]',
  wrong: 'border-[#F4C7C1] bg-[#FDECE9]',
}

export function AnswerOption({ status = 'default', onSelect, children }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-[14px] border-2 px-[15px] py-[14px] text-left font-body text-base transition-colors',
        STATUS_CLASSES[status],
      )}
    >
      <span>{children}</span>
      {status === 'selected' && <span className="h-3 w-3 shrink-0 rounded-full bg-teal-500" />}
      {status === 'correct' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success">
          <CheckIcon weight="bold" className="h-4 w-4 text-white" />
        </span>
      )}
      {status === 'wrong' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error">
          <XIcon weight="bold" className="h-4 w-4 text-white" />
        </span>
      )}
    </button>
  )
}
