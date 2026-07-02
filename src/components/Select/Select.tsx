import { forwardRef, type SelectHTMLAttributes } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label: string
  options: SelectOption[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, options, error, className, ...props }, ref) => {
    const hasError = Boolean(error)
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="font-body text-[13px] font-semibold text-[#3A454F] mb-[7px]">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={hasError}
            className={clsx(
              'appearance-none w-full font-body text-[15px] bg-white border-[1.5px] rounded-md pl-[14px] pr-10 py-3 outline-none transition-shadow',
              hasError
                ? 'border-error shadow-focus-error'
                : 'border-border-input focus:border-teal-500 focus:shadow-focus-teal',
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        </div>
        {error && <span className="text-[12.5px] font-medium text-error mt-1">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
