import { type ReactNode } from 'react'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

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
      className={clsx(
        'w-full flex items-center justify-between text-left rounded-[14px] border-2 px-[15px] py-[14px] font-body text-base transition-colors',
        STATUS_CLASSES[status],
      )}
    >
      <span>{children}</span>
      {status === 'selected' && <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />}
      {status === 'correct' && (
        <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
          <CheckIcon weight="bold" className="w-4 h-4 text-white" />
        </span>
      )}
      {status === 'wrong' && (
        <span className="w-6 h-6 rounded-full bg-error flex items-center justify-center shrink-0">
          <XIcon weight="bold" className="w-4 h-4 text-white" />
        </span>
      )}
    </button>
  )
}
