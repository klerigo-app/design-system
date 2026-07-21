import { useState, type ReactElement, type ReactNode } from 'react'
import { Modal as RNModal, Pressable, View } from 'react-native'
import { radiusValue, type Palette } from '../tokens/tokens'
import { createThemedStyles, useTheme, useThemedStyles } from './theme'
import { Heading, Text } from './Text'
import { Field } from './Field'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'

export type ModalVariant = 'info' | 'warning' | 'error' | 'success'

const variantBadgeColor = (palette: Palette): Record<ModalVariant, string> => ({
  info: palette.info,
  warning: palette.warning,
  error: palette.error,
  success: palette.success,
})

export interface ModalProps {
  isOpen: boolean
  /** Called on hardware back press (Android) and overlay tap (when enabled). */
  onClose: () => void
  variant?: ModalVariant
  title: string
  description?: string
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
}

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
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmationValue,
  confirmationLabel,
  confirmationPlaceholder,
  closeOnOverlayClick = true,
}: ModalProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  const palette = useTheme()
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
          <View style={[styles.badge, { backgroundColor: variantBadgeColor(palette)[variant] }]} />

          <Heading size="md">{title}</Heading>
          {description && (
            <Text variant="muted" style={styles.description}>
              {description}
            </Text>
          )}

          {children}

          {requiresConfirmationMatch && (
            <View style={styles.confirmationGroup}>
              <Text variant="muted">
                {confirmationLabel ?? `To confirm, write "${confirmationValue}"`}
              </Text>
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
            {onCancel && <SecondaryButton label={cancelText} onPress={onCancel} />}
            {variant === 'error' ? (
              <Pressable
                accessibilityRole="button"
                disabled={isConfirmDisabled}
                onPress={onConfirm}
                style={[styles.dangerButton, isConfirmDisabled && styles.disabled]}
              >
                <Text style={styles.dangerLabel}>{confirmText}</Text>
              </Pressable>
            ) : (
              <PrimaryButton label={confirmText} disabled={isConfirmDisabled} onPress={onConfirm} />
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const themedStyles = createThemedStyles((palette) => ({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    // scrim @ ~60% opacity (RN supports 8-digit hex). Its own token because
    // dark wants pure black behind the card, not a lifted ink.
    backgroundColor: `${palette.scrim}99`,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    borderRadius: radiusValue['2xl'],
    backgroundColor: palette.surfaceRaised,
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
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusValue.lg,
    backgroundColor: palette.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerLabel: {
    fontWeight: '700',
    // White on a saturated semantic fill, per the dark-mode conventions.
    color: '#FFFFFF',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
}))
