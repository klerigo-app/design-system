import { type ReactElement } from 'react'
import { Pressable, Text, type PressableProps } from 'react-native'
import { radiusValue } from '../tokens/tokens'
import { createThemedStyles, useThemedStyles } from './theme'

export interface SecondaryButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string
}

/**
 * Secondary (outline) button. Replaces the repeated
 * `rounded-lg border border-slate px-4 py-3` + `text-ink` Pressable/Text pair
 * (e.g. the "Log out" action).
 *
 * Explicit return type avoids a non-portable @types/react reference in the
 * emitted declaration when this package is built as a git dependency (TS2883).
 */
export function SecondaryButton({ label, disabled, ...props }: SecondaryButtonProps): ReactElement {
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
    borderWidth: 1,
    borderColor: theme.colors.slate,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: theme.colors.ink,
    fontSize: 16,
  },
}))
