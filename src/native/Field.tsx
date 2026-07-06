import { forwardRef } from 'react'
import {
  StyleSheet,
  TextInput,
  type TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native'
import { colors, radiusValue } from '../tokens/tokens'

/**
 * Text input styled to the design system. Replaces the repeated
 * `rounded-lg border border-slate px-4 py-3 text-ink` input className.
 */
export const Field = forwardRef<RNTextInput, TextInputProps>(({ style, ...props }, ref) => {
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

const styles = StyleSheet.create({
  field: {
    borderRadius: radiusValue.lg,
    borderWidth: 1,
    borderColor: colors.slate,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
})
