import { createContext } from 'react'
import type { ToastOptions } from './types'

export interface ToastContextValue {
  /** Show a toast; returns its id for later `dismiss(id)`. */
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
