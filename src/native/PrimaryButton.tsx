import { type ReactElement } from 'react'
import { Pressable, Text, type PressableProps } from 'react-native'
import { radiusValue } from '../tokens/tokens'
import { createThemedStyles, useThemedStyles } from './theme'

export interface PrimaryButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string
}

/**
 * Primary (coral) call-to-action button. Replaces the repeated
 * `items-center rounded-lg bg-coral-500 px-4 py-3` + `font-bold text-white`
 * Pressable/Text pair on the screens.
 *
 * Explicit return type avoids a non-portable @types/react reference in the
 * emitted declaration when this package is built as a git dependency (TS2883).
 */
export function PrimaryButton({ label, disabled, ...props }: PrimaryButtonProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const themedStyles = createThemedStyles((theme) => ({
  button: {
    alignItems: 'center',
    borderRadius: radiusValue.lg,
    backgroundColor: theme.colors.coral[500],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '700',
    // White on a saturated brand fill reads in both themes; coral-500 does not flip.
    color: '#FFFFFF',
    fontSize: 16,
  },
}))
