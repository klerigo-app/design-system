import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-6 h-6 shrink-0">
        <input
          ref={ref}
          id={id}
          type="radio"
          className={clsx(
            'peer appearance-none w-6 h-6 rounded-full border-2 border-border-input checked:border-teal-500',
            className,
          )}
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 m-auto w-3 h-3 rounded-full bg-teal-500 opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Radio.displayName = 'Radio'
