import { forwardRef, type InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

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
        <MagnifyingGlassIcon className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          ref={ref}
          id={id}
          type="search"
          placeholder={placeholder}
          className={clsx(
            'w-full font-body text-[15px] bg-white border-[1.5px] border-border-input rounded-md pl-11 pr-[14px] py-3 outline-none placeholder:text-muted focus:border-teal-500 focus:shadow-focus-teal transition-shadow',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
SearchField.displayName = 'SearchField'
