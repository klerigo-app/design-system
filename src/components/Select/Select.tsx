import { forwardRef, type SelectHTMLAttributes } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { FieldLabel, FieldMessage, fieldControlStyles } from '../../internal/field'

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
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={hasError}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              fieldControlStyles({ error: hasError }),
              'w-full appearance-none py-3 pl-[14px] pr-10',
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
          <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        </div>
        {error && (
          <FieldMessage id={`${id}-error`} tone="error">
            {error}
          </FieldMessage>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
