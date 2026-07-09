import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cva } from 'class-variance-authority'
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { Button } from '../Button/Button'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { TextInput } from '../TextInput/TextInput'

export type ModalVariant = 'info' | 'warning' | 'error' | 'success'
export type ModalSize = 'md' | 'lg'

const VARIANT_ICON = {
  info: InfoIcon,
  warning: WarningIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
} satisfies Record<ModalVariant, typeof InfoIcon>

const VARIANT_BADGE_CLASSES: Record<ModalVariant, string> = {
  info: 'bg-teal-50 text-info',
  warning: 'bg-sun-50 text-warning',
  error: 'bg-error-tint text-error',
  success: 'bg-success-tint text-success',
}

type ModalPanelStyleProps = {
  size?: ModalSize
}

const modalPanelStyles: (props?: ModalPanelStyleProps) => string = cva(
  'relative flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-elevated outline-none',
  {
    variants: {
      size: {
        md: 'max-w-md',
        lg: 'max-w-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export interface ModalProps {
  isOpen: boolean
  /** Called on Escape and overlay click (when enabled). Does not fire from the Confirm/Cancel buttons. */
  onClose: () => void
  variant?: ModalVariant
  /** Panel width. Defaults to 'md' (max-w-md); use 'lg' for wider forms (max-w-xl). */
  size?: ModalSize
  title: string
  description?: ReactNode
  children?: ReactNode
  onConfirm: () => void
  /** Cancel button is only rendered when this is provided. */
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  /** When set, Confirm stays disabled until the typed text exactly matches this value. */
  confirmationValue?: string
  confirmationLabel?: string
  confirmationPlaceholder?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  isOpen,
  onClose,
  variant = 'info',
  size = 'md',
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmationValue,
  confirmationLabel,
  confirmationPlaceholder,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const [confirmationInput, setConfirmationInput] = useState('')
  const [wasOpen, setWasOpen] = useState(isOpen)
  const titleId = useId()
  const descriptionId = useId()
  const confirmationInputId = useId()

  // Reset the confirmation field whenever the modal transitions to open.
  // Adjusting state during render (rather than in an effect) avoids an
  // extra render pass — see https://react.dev/learn/you-might-not-need-an-effect
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setConfirmationInput('')
  }

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(focusable?.[0] ?? panel)?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocusedRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (closeOnEscape) onClose()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  const Icon = VARIANT_ICON[variant]
  const requiresConfirmationMatch = confirmationValue !== undefined
  const isConfirmDisabled = requiresConfirmationMatch && confirmationInput !== confirmationValue

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-ink opacity-60"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={modalPanelStyles({ size })}
      >
        <span
          aria-hidden
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            VARIANT_BADGE_CLASSES[variant],
          )}
        >
          <Icon weight="bold" className="h-6 w-6" />
        </span>

        <div className="flex flex-col gap-1">
          <Heading as="h2" size="md" id={titleId}>
            {title}
          </Heading>
          {description && (
            <Text id={descriptionId} variant="muted">
              {description}
            </Text>
          )}
        </div>

        {children}

        {requiresConfirmationMatch && (
          <TextInput
            id={confirmationInputId}
            label={confirmationLabel ?? `Para confirmar, escribe "${confirmationValue}"`}
            placeholder={confirmationPlaceholder}
            value={confirmationInput}
            onChange={(event) => setConfirmationInput(event.target.value)}
            autoComplete="off"
          />
        )}

        <div className="mt-2 flex justify-end gap-3">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            variant={variant === 'error' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
