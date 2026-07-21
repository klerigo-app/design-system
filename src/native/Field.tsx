import { forwardRef } from 'react'
import { TextInput, type TextInput as RNTextInput, type TextInputProps } from 'react-native'
import { radiusValue } from '../tokens/tokens'
import { createThemedStyles, useTheme, useThemedStyles } from './theme'

/**
 * Text input styled to the design system. Replaces the repeated
 * `rounded-lg border border-slate px-4 py-3 text-ink` input className.
 */
export const Field = forwardRef<RNTextInput, TextInputProps>(({ style, ...props }, ref) => {
  const styles = useThemedStyles(themedStyles)
  // placeholderTextColor is a prop, not a style, so it cannot live in the sheet.
  const { colors } = useTheme()
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.muted}
      style={[styles.field, style]}
      {...props}
    />
  )
})
Field.displayName = 'Field'

const themedStyles = createThemedStyles((theme) => ({
  field: {
    borderRadius: radiusValue.lg,
    borderWidth: 1,
    borderColor: theme.colors.slate,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.ink,
    fontSize: 16,
  },
}))
