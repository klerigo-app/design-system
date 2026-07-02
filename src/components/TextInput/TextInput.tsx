import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  helperText?: string
  error?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, helperText, error, className, ...props }, ref) => {
    const hasError = Boolean(error)
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="font-body text-[13px] font-semibold text-[#3A454F] mb-[7px]">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={clsx(
            'font-body text-[15px] bg-white border-[1.5px] rounded-md px-[14px] py-3 outline-none transition-shadow',
            hasError
              ? 'border-error shadow-focus-error'
              : 'border-border-input focus:border-teal-500 focus:shadow-focus-teal',
            className,
          )}
          {...props}
        />
        {error ? (
          <span id={`${id}-error`} className="text-[12.5px] font-medium text-error mt-1">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${id}-helper`} className="text-[12.5px] font-medium text-slate mt-1">
            {helperText}
          </span>
        ) : null}
      </div>
    )
  },
)
TextInput.displayName = 'TextInput'
