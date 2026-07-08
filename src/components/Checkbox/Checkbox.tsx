import { forwardRef, type InputHTMLAttributes } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { ControlLabel } from '../../internal/ControlLabel'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, className, ...props }, ref) => {
    return (
      <ControlLabel htmlFor={id} label={label}>
        <span className="relative inline-flex h-6 w-6 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={cn(
              'peer h-6 w-6 cursor-pointer appearance-none rounded-sm border-2 border-border-input checked:border-coral-500 checked:bg-coral-500',
              className,
            )}
            {...props}
          />
          <CheckIcon
            weight="bold"
            className="pointer-events-none absolute inset-0 h-6 w-6 p-1 text-white opacity-0 peer-checked:opacity-100"
          />
        </span>
      </ControlLabel>
    )
  },
)
Checkbox.displayName = 'Checkbox'
