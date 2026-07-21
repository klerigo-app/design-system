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
  'relative flex w-full flex-col gap-4 rounded-2xl bg-surface-raised p-6 shadow-elevated outline-none',
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

interface ModalBaseProps {
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
  /** Required: this component previously defaulted it to Spanish. */
  confirmText: string
  confirmationPlaceholder?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

/**
 * Button and prompt strings are required rather than defaulted.
 *
 * They used to default to 'Confirmar' / 'Cancelar', with a hardcoded
 * confirmation prompt behind them, which shipped Spanish to any caller who
 * forgot. The issue that prompted this framed it as a /native leftover; both
 * Modals had it, and fixing only native would have left the two prop contracts
 * diverging — web/native drift pointing the other way.
 *
 * Required-ness is a discriminated union rather than three flat required props,
 * because two of the three are only rendered conditionally: a modal with no
 * cancel button should not be asked to invent a label for one.
 *
 * The union has two sharp edges, both found integrating it:
 *
 *  - Spreading `ModalProps` works, but `Omit<ModalProps, K>` does not — `Omit`
 *    does not distribute over unions, so it collapses the branches into
 *    something no value satisfies. Use a distributive omit:
 *    `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never`
 *  - A conditional call site cannot inline the correlation; see
 *    `ModalCancelProps` below.
 */

/**
 * The cancel button and its label, together or not at all.
 *
 * Exported because a call site that decides conditionally cannot express this
 * inline: neither `onCancel={x ? fn : undefined}` nor a conditional spread
 * preserves the correlation — TypeScript widens both branches to optional and
 * no union member matches. Annotating the value does work:
 *
 *   const cancelProps: ModalCancelProps = canDismiss
 *     ? { onCancel: close, cancelText: 'Close' }
 *     : {}
 *   <Modal {...cancelProps} ... />
 */
export type ModalCancelProps =
  { onCancel: () => void; cancelText: string } | { onCancel?: never; cancelText?: never }

/** The type-to-confirm value and the prompt that explains it, together or not at all. */
export type ModalConfirmationProps =
  | { confirmationValue: string; confirmationLabel: string }
  | { confirmationValue?: never; confirmationLabel?: never }

export type ModalProps = ModalBaseProps & ModalCancelProps & ModalConfirmationProps

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
  confirmText,
  cancelText,
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
        className="absolute inset-0 bg-scrim opacity-60"
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
            label={confirmationLabel}
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
