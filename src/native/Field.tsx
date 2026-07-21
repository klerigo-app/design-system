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
  const palette = useTheme()
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={palette.muted}
      style={[styles.field, style]}
      {...props}
    />
  )
})
Field.displayName = 'Field'

const themedStyles = createThemedStyles((palette) => ({
  field: {
    borderRadius: radiusValue.lg,
    borderWidth: 1,
    borderColor: palette.slate,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: palette.ink,
    fontSize: 16,
  },
}))
