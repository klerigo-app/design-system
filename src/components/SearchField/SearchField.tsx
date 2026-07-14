import { forwardRef, type InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { fieldControlStyles } from '../../internal/field'

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type' | 'placeholder'
> {
  id: string
  'aria-label': string
  placeholder: string
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ id, className, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        {/* Centered vertically with inset + auto margins rather than a
            translate transform: consumers on a different Tailwind major
            (e.g. v4) compose the `--tw-*` transform vars differently, which
            would leave a translate-based centering unresolved. */}
        <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-[14px] my-auto h-5 w-5 text-muted" />
        <input
          ref={ref}
          id={id}
          type="search"
          placeholder={placeholder}
          className={cn(
            fieldControlStyles(),
            'w-full py-3 pl-11 pr-[14px] placeholder:text-muted',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
SearchField.displayName = 'SearchField'
