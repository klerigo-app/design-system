import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { ControlLabel } from '../../internal/ControlLabel'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ id, label, className, ...props }, ref) => {
    return (
      <ControlLabel htmlFor={id} label={label}>
        <span className="relative inline-flex h-7 w-12 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            className={cn('peer sr-only', className)}
            {...props}
          />
          <span className="absolute inset-0 rounded-pill bg-border-input transition-colors peer-checked:bg-teal-500" />
          {/* Slide with `left`, not a translate: a transform composes through
              the consumer's Tailwind `--tw-*` vars, which differ across majors
              and can leave the knob stuck at the off position. */}
          <span className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-[left] peer-checked:left-[23px]" />
        </span>
      </ControlLabel>
    )
  },
)
Toggle.displayName = 'Toggle'
