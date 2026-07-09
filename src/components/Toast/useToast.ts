import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from './context'

/** Access the toast API. Must be called under a `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}
