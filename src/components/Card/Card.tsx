import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — `class`/`className` are never
// passed to this call directly (cn() merges className afterwards instead),
// so they're safely omitted here.
type CardStyleProps = {
  variant?: 'flat' | 'elevated' | 'feature'
  interactive?: boolean
}

const cardStyles: (props?: CardStyleProps) => string = cva('rounded-xl', {
  variants: {
    variant: {
      flat: 'border border-border bg-white p-6',
      elevated: 'border border-border bg-white p-6 shadow-elevated',
      feature: 'relative overflow-hidden bg-ink p-6 text-white',
    },
    interactive: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'elevated',
      interactive: true,
      class: 'transition-transform hover:-translate-y-1',
    },
  ],
  defaultVariants: {
    variant: 'flat',
    interactive: false,
  },
})

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {
  decorativeCircle?: boolean
  children?: ReactNode
}

export function Card({
  variant,
  interactive,
  decorativeCircle,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(cardStyles({ variant, interactive }), className)} {...props}>
      {variant === 'feature' && decorativeCircle && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sun-500 opacity-[0.17]"
        />
      )}
      {children}
    </div>
  )
}
