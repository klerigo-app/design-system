import { useState, type ReactElement, type ReactNode } from 'react'
import { Modal as RNModal, Pressable, View } from 'react-native'
import { radiusValue, type Palette } from '../tokens/tokens'
import { createThemedStyles, useTheme, useThemedStyles } from './theme'
import { Heading, Text } from './Text'
import { Field } from './Field'
import { PrimaryButton } from './PrimaryButton'
import { GhostButton } from './GhostButton'
import { DangerButton } from './DangerButton'

export type ModalVariant = 'info' | 'warning' | 'error' | 'success'

const variantBadgeColor = (palette: Palette): Record<ModalVariant, string> => ({
  info: palette.info,
  warning: palette.warning,
  error: palette.error,
  success: palette.success,
})

interface ModalBaseProps {
  isOpen: boolean
  /** Called on hardware back press (Android) and overlay tap (when enabled). */
  onClose: () => void
  variant?: ModalVariant
  title: string
  description?: string
  children?: ReactNode
  onConfirm: () => void
  /** Required: this component previously defaulted it to Spanish. */
  confirmText: string
  confirmationPlaceholder?: string
  closeOnOverlayClick?: boolean
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

/**
 * Confirmation dialog built on React Native's built-in `Modal`. Mirrors the
 * web `Modal` component's variant/confirm/cancel/type-to-confirm API.
 */
export function Modal({
  isOpen,
  onClose,
  variant = 'info',
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
}: ModalProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  const { colors } = useTheme()
  const [confirmationInput, setConfirmationInput] = useState('')
  const requiresConfirmationMatch = confirmationValue !== undefined
  const isConfirmDisabled = requiresConfirmationMatch && confirmationInput !== confirmationValue

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setConfirmationInput('')}
    >
      <Pressable style={styles.overlay} onPress={closeOnOverlayClick ? onClose : undefined}>
        {/* Empty onPress claims the touch responder so taps on the card don't
            fall through to the overlay's onPress above. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.badge, { backgroundColor: variantBadgeColor(colors)[variant] }]} />

          <Heading size="md">{title}</Heading>
          {description && (
            <Text variant="muted" style={styles.description}>
              {description}
            </Text>
          )}

          {children}

          {requiresConfirmationMatch && (
            <View style={styles.confirmationGroup}>
              {/* No fallback string: confirmationLabel is required whenever
                  confirmationValue is set. The old English default here was
                  the mirror of web's Spanish one. */}
              <Text variant="muted">{confirmationLabel}</Text>
              <Field
                value={confirmationInput}
                onChangeText={setConfirmationInput}
                placeholder={confirmationPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.actions}>
            {/* Ghost, matching web (Modal.tsx:216). This used to be the
                slate-outlined SecondaryButton, so the two Modals disagreed on
                the cancel button's whole visual identity. */}
            {onCancel && <GhostButton label={cancelText} onPress={onCancel} />}
            {variant === 'error' ? (
              // Was hand-rolled inline here; DangerButton absorbs it.
              <DangerButton label={confirmText} disabled={isConfirmDisabled} onPress={onConfirm} />
            ) : (
              <PrimaryButton label={confirmText} disabled={isConfirmDisabled} onPress={onConfirm} />
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const themedStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    // scrim @ ~60% opacity (RN supports 8-digit hex). Its own token because
    // dark wants pure black behind the card, not a lifted ink.
    backgroundColor: `${theme.colors.scrim}99`,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    borderRadius: radiusValue['2xl'],
    backgroundColor: theme.colors.surfaceRaised,
    padding: 24,
  },
  badge: {
    height: 48,
    width: 48,
    borderRadius: radiusValue['2xl'],
  },
  description: {
    marginTop: -8,
  },
  confirmationGroup: {
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
}))
