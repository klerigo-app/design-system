import { type ReactNode } from 'react'

/**
 * Shared clickable-label wrapper for selection controls (Checkbox, Radio,
 * Toggle): control on the left, label text on the right.
 * Internal — not part of the public package API.
 */
export function ControlLabel({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string
  label: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="inline-flex cursor-pointer select-none items-center gap-2">
      {children}
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
}
