import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native'
import { colors, radiusValue } from '../tokens/tokens'
import { Heading, Text } from './Text'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastLink {
  label: string
  onPress?: () => void
}

export interface ToastOptions {
  variant?: ToastVariant
  title: string
  body?: string
  links?: ToastLink[]
  /** ms until auto-dismiss; `null` persists. Omit → error persists, others 5000. */
  duration?: number | null
}

interface ToastRecord extends ToastOptions {
  id: string
  variant: ToastVariant
  duration: number | null
}

const VARIANT_COLOR: Record<ToastVariant, string> = {
  info: colors.info,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Access the toast API. Must be called under a `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

const DEFAULT_DURATION = 5000

export interface ToastProviderProps {
  children: ReactNode
  duration?: number
  max?: number
}

/**
 * React Native mirror of the web `ToastProvider`. Renders an absolutely
 * positioned bottom-right overlay (no DOM portal) and exposes the same
 * `useToast()` API. The web-only countdown drain is replaced here by a static
 * variant shelf; auto-dismiss timing and press-to-pause still apply.
 */
export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  max = 4,
}: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => setToasts([]), [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${idRef.current++}`
      const variant = options.variant ?? 'info'
      const record: ToastRecord = {
        ...options,
        id,
        variant,
        duration:
          options.duration !== undefined ? options.duration : variant === 'error' ? null : duration,
      }
      setToasts((prev) => {
        const next = [...prev, record]
        return next.length > max ? next.slice(next.length - max) : next
      })
      return id
    },
    [duration, max],
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.viewport} pointerEvents="box-none">
        {toasts.map((item) => (
          <ToastItem key={item.id} record={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

function ToastItem({
  record,
  onDismiss,
}: {
  record: ToastRecord
  onDismiss: () => void
}): ReactElement {
  // Lazy state (not a ref) so it can be read during render without tripping
  // react-hooks/refs; the initializer runs once, so the value is stable.
  const [anim] = useState(() => new Animated.Value(0))
  const remaining = useRef<number | null>(record.duration)
  const startedAt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const schedule = (ms: number | null) => {
    clear()
    if (ms === null) return
    startedAt.current = Date.now()
    timer.current = setTimeout(onDismiss, ms)
  }

  const pause = () => {
    if (remaining.current === null || timer.current === null) return
    clear()
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current))
  }

  const resume = () => schedule(remaining.current)

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start()
    AccessibilityInfo.announceForAccessibility(
      record.body ? `${record.title}. ${record.body}` : record.title,
    )
    schedule(record.duration)
    return clear
    // Run once on mount; record identity is stable for a given toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] })
  const assertive = record.variant === 'error' || record.variant === 'warning'

  return (
    <Animated.View
      style={[styles.card, { opacity: anim, transform: [{ translateY }] }]}
      accessibilityLiveRegion={assertive ? 'assertive' : 'polite'}
    >
      <Pressable style={styles.pressArea} onPressIn={pause} onPressOut={resume}>
        <View style={[styles.badge, { backgroundColor: VARIANT_COLOR[record.variant] }]} />
        <View style={styles.content}>
          <Heading size="md" style={styles.title}>
            {record.title}
          </Heading>
          {record.body ? <Text variant="muted">{record.body}</Text> : null}
          {record.links && record.links.length > 0 ? (
            <View style={styles.links}>
              {record.links.map((link, index) => (
                <Pressable key={index} onPress={link.onPress} accessibilityRole="button">
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={styles.close}
          hitSlop={8}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </Pressable>
      {record.duration !== null ? (
        <View style={[styles.shelf, { backgroundColor: VARIANT_COLOR[record.variant] }]} />
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 12,
    alignItems: 'flex-end',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radiusValue['2xl'],
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#5A3C1E',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pressArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  badge: {
    height: 40,
    width: 40,
    borderRadius: radiusValue.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  linkText: {
    color: colors.teal[700],
    fontWeight: '600',
  },
  close: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.muted,
  },
  shelf: {
    height: 4,
    width: '100%',
  },
})
