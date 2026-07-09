import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ToastContext, type ToastContextValue } from './context'
import { Toast } from './Toast'
import type { ToastOptions, ToastRecord, ToastVariant } from './types'

const DEFAULT_DURATION = 5000

export interface ToastProviderProps {
  children: ReactNode
  /** Auto-dismiss time in ms for non-error variants. Default 5000. */
  duration?: number
  /** Max toasts shown at once; older ones beyond this are dropped. Default 4. */
  max?: number
}

/** Resolves the effective duration: caller override wins, else error persists. */
function resolveDuration(
  variant: ToastVariant,
  optionDuration: number | null | undefined,
  fallback: number,
): number | null {
  if (optionDuration !== undefined) return optionDuration
  return variant === 'error' ? null : fallback
}

interface TimerEntry {
  remaining: number
  start: number
  handle: ReturnType<typeof setTimeout> | null
  running: boolean
}

/**
 * Owns the toast queue and auto-dismiss timers, and renders the bottom-right
 * viewport into a portal. Hovering or keyboard-focusing the stack pauses every
 * visible toast at once (banking the remaining time), so timing stays accurate.
 */
export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  max = 4,
}: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const idRef = useRef(0)
  const timers = useRef(new Map<string, TimerEntry>())

  const paused = hovered || focused

  const dismiss = useCallback((id: string) => {
    const entry = timers.current.get(id)
    if (entry?.handle) clearTimeout(entry.handle)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    for (const entry of timers.current.values()) {
      if (entry.handle) clearTimeout(entry.handle)
    }
    timers.current.clear()
    setToasts([])
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${idRef.current++}`
      const variant = options.variant ?? 'info'
      const record: ToastRecord = {
        ...options,
        id,
        variant,
        duration: resolveDuration(variant, options.duration, duration),
      }
      setToasts((prev) => {
        const next = [...prev, record]
        return next.length > max ? next.slice(next.length - max) : next
      })
      return id
    },
    [duration, max],
  )

  // Reconcile timers with the current toasts and pause state. Runs whenever the
  // list or pause state changes; banks elapsed time on every run so pausing and
  // list changes both keep the countdown accurate.
  useEffect(() => {
    const map = timers.current
    const now = Date.now()

    for (const id of [...map.keys()]) {
      if (!toasts.some((t) => t.id === id)) {
        const entry = map.get(id)!
        if (entry.handle) clearTimeout(entry.handle)
        map.delete(id)
      }
    }

    for (const item of toasts) {
      if (item.duration === null) continue
      let entry = map.get(item.id)
      if (!entry) {
        entry = { remaining: item.duration, start: now, handle: null, running: false }
        map.set(item.id, entry)
      }
      if (entry.running && entry.handle) {
        clearTimeout(entry.handle)
        entry.handle = null
        entry.remaining = Math.max(0, entry.remaining - (now - entry.start))
        entry.running = false
      }
      if (!paused) {
        entry.start = now
        entry.running = true
        entry.handle = setTimeout(() => dismiss(item.id), entry.remaining)
      }
    }
  }, [toasts, paused, dismiss])

  // Clear every pending timer when the provider unmounts.
  useEffect(
    () => () => {
      for (const entry of timers.current.values()) {
        if (entry.handle) clearTimeout(entry.handle)
      }
      timers.current.clear()
    },
    [],
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  )

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    // Stay paused while focus moves between children of the viewport.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocused(false)
    }
  }

  const viewport =
    typeof document !== 'undefined' && toasts.length > 0
      ? createPortal(
          <div
            className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col items-end gap-3"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
          >
            {toasts.map((item) => (
              <Toast
                key={item.id}
                variant={item.variant}
                title={item.title}
                body={item.body}
                links={item.links}
                duration={item.duration}
                paused={paused}
                onDismiss={() => dismiss(item.id)}
              />
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      {viewport}
    </ToastContext.Provider>
  )
}
