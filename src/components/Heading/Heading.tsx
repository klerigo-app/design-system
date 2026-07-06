import { type HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — `class`/`className` are never
// passed to this call directly (cn() merges className afterwards instead).
type HeadingStyleProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const headingStyles: (props?: HeadingStyleProps) => string = cva(
  'font-display font-medium text-ink',
  {
    variants: {
      size: {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  },
)

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic element to render; pick by document outline, not by size. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Display-font heading. Covers the recurring
 * `font-display font-medium text-* text-ink` stacks so they stay consistent
 * across apps.
 */
export function Heading({ as: Tag = 'h2', size, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingStyles({ size }), className)} {...props} />
}
