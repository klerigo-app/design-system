import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — `class`/`className` are never
// passed to this call directly (clsx() merges className afterwards instead),
// so they're safely omitted here.
type CardStyleProps = {
  variant?: 'flat' | 'elevated' | 'feature'
}

const cardStyles: (props?: CardStyleProps) => string = cva('rounded-xl', {
  variants: {
    variant: {
      flat: 'bg-white border border-border p-6',
      elevated: 'bg-white border border-border p-6 shadow-elevated transition-transform hover:-translate-y-1',
      feature: 'bg-ink text-white p-6 relative overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'flat',
  },
})

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {
  decorativeCircle?: boolean
  children?: ReactNode
}

export function Card({ variant, decorativeCircle, className, children, ...props }: CardProps) {
  return (
    <div className={clsx(cardStyles({ variant }), className)} {...props}>
      {variant === 'feature' && decorativeCircle && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-sun-500 opacity-[0.17]"
        />
      )}
      {children}
    </div>
  )
}
