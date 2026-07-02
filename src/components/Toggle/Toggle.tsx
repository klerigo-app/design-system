import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-12 h-7 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          className={clsx('peer sr-only', className)}
          {...props}
        />
        <span className="absolute inset-0 rounded-pill bg-border-input transition-colors peer-checked:bg-teal-500" />
        <span className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Toggle.displayName = 'Toggle'
