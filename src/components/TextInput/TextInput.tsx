import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { FieldLabel, FieldMessage, fieldControlStyles } from '../../internal/field'

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
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={cn(fieldControlStyles({ error: hasError }), 'px-[14px] py-3', className)}
          {...props}
        />
        {error ? (
          <FieldMessage id={`${id}-error`} tone="error">
            {error}
          </FieldMessage>
        ) : helperText ? (
          <FieldMessage id={`${id}-helper`} tone="helper">
            {helperText}
          </FieldMessage>
        ) : null}
      </div>
    )
  },
)
TextInput.displayName = 'TextInput'
