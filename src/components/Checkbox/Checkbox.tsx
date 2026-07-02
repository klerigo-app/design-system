import { forwardRef, type InputHTMLAttributes } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-6 h-6 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={clsx(
            'peer appearance-none w-6 h-6 rounded-sm border-2 border-border-input checked:bg-coral-500 checked:border-coral-500',
            className,
          )}
          {...props}
        />
        <CheckIcon
          weight="bold"
          className="pointer-events-none absolute inset-0 w-6 h-6 p-1 text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Checkbox.displayName = 'Checkbox'
