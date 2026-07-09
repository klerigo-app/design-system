import type { ReactNode } from 'react'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastLink {
  label: string
  /** Renders an anchor when set; otherwise a button. */
  href?: string
  onClick?: () => void
}

export interface ToastOptions {
  variant?: ToastVariant
  title: string
  body?: ReactNode
  /** Optional footer links, rendered as a row of text links. */
  links?: ToastLink[]
  /**
   * Milliseconds until auto-dismiss; `null` keeps the toast until dismissed.
   * When omitted, `error` persists and every other variant uses the
   * provider's default (5000ms).
   */
  duration?: number | null
}

/** Internal record held by the provider — options with resolved id + duration. */
export interface ToastRecord extends ToastOptions {
  id: string
  variant: ToastVariant
  duration: number | null
}
