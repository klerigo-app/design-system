import { type HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — `class`/`className` are never
// passed to this call directly (cn() merges className afterwards instead).
type TextStyleProps = {
  variant?: 'body' | 'muted' | 'kicker'
}

const textStyles: (props?: TextStyleProps) => string = cva('font-body', {
  variants: {
    variant: {
      body: 'text-base text-ink',
      muted: 'text-sm text-slate',
      kicker: 'text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div'
  variant?: 'body' | 'muted' | 'kicker'
}

/**
 * Body-font text primitive. `kicker` is the small uppercase section eyebrow;
 * recolor it via className (e.g. `text-sun-500`) — cn() resolves the conflict.
 */
export function Text({ as: Tag = 'p', variant, className, ...props }: TextProps) {
  return <Tag className={cn(textStyles({ variant }), className)} {...props} />
}
