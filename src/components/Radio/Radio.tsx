import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { ControlLabel } from '../../internal/ControlLabel'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ id, label, className, ...props }, ref) => {
    return (
      <ControlLabel htmlFor={id} label={label}>
        <span className="relative inline-flex h-6 w-6 shrink-0">
          <input
            ref={ref}
            id={id}
            type="radio"
            className={cn(
              'peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-border-input checked:border-teal-500',
              className,
            )}
            {...props}
          />
          <span className="pointer-events-none absolute inset-0 m-auto h-3 w-3 rounded-full bg-teal-500 opacity-0 peer-checked:opacity-100" />
        </span>
      </ControlLabel>
    )
  },
)
Radio.displayName = 'Radio'
