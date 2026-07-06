import { type ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Shared building blocks for form fields (TextInput, Select, SearchField).
 * Internal — not part of the public package API.
 */

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-[7px] font-body text-[13px] font-semibold text-label">
      {children}
    </label>
  )
}

export function FieldMessage({
  id,
  tone,
  children,
}: {
  id: string
  tone: 'error' | 'helper'
  children: ReactNode
}) {
  return (
    <span
      id={id}
      className={cn(
        'mt-1 text-[12.5px] font-medium',
        tone === 'error' ? 'text-error' : 'text-slate',
      )}
    >
      {children}
    </span>
  )
}

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — `class`/`className` are never
// passed to this call directly (cn() merges className afterwards instead).
type FieldControlStyleProps = {
  error?: boolean
}

/** Base look + border/focus/error states shared by every field control. */
export const fieldControlStyles: (props?: FieldControlStyleProps) => string = cva(
  'rounded-md border-[1.5px] bg-white font-body text-[15px] outline-none transition-shadow',
  {
    variants: {
      error: {
        true: 'border-error shadow-focus-error',
        false: 'border-border-input focus:border-teal-500 focus:shadow-focus-teal',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
)
