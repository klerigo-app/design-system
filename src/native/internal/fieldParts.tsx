import { type ReactElement, type ReactNode } from 'react'
import { Text as RNText } from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

/**
 * Shared building blocks for form fields — the native counterpart of
 * src/internal/field.tsx, which four web components already compose.
 *
 * Internal: not exported from index.ts. `TextInput`, `Select` and `MultiSelect`
 * assemble the label and message from here, and `fieldStyles.control` is what
 * gives the option sheet's trigger the same box as a real field rather than a
 * lookalike that drifts from it.
 */

/** Field label. Mirrors web's `mb-[7px] font-body text-[13px] font-semibold text-label`. */
export function FieldLabel({ children }: { children: ReactNode }): ReactElement {
  const styles = useThemedStyles(fieldStyles)
  return <RNText style={styles.label}>{children}</RNText>
}

/** Helper or error text below a control. Web: `mt-1 text-[12.5px] font-medium`. */
export function FieldMessage({
  tone,
  children,
}: {
  tone: 'error' | 'helper'
  children: ReactNode
}): ReactElement {
  const styles = useThemedStyles(fieldStyles)
  return (
    <RNText style={[styles.message, tone === 'error' ? styles.messageError : styles.messageHelper]}>
      {children}
    </RNText>
  )
}

/**
 * Base look plus border/focus/error states, shared by every field control —
 * the native shape of web's `fieldControlStyles` cva.
 *
 * Focus and error live on the control rather than on the wrapper, matching web,
 * so a bare `Field` gets them too. That is what gives Modal's type-to-confirm
 * input a focus ring.
 */
export const fieldStyles = createThemedStyles((theme) => ({
  /**
   * The box: border, surface and focus ring. A wrapper View rather than the
   * TextInput itself, and it deliberately carries no padding.
   *
   * On Android, changing a view's background resets its padding to the
   * background drawable's own — so putting the focus ring on the TextInput made
   * its horizontal padding collapse from 16dp to ~5dp the moment it was
   * focused, and the text visibly jumped left. Splitting them means the view
   * whose background changes has no padding to lose, and the view with the
   * padding never changes background.
   */
  control: {
    // rounded-md (12), not the lg (16) native used before: web's field radius
    // is one step tighter than its button radius.
    borderRadius: radiusValue.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surfaceRaised,
  },
  /** The text itself. Transparent and border-free; owns the padding. */
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.ink,
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  /**
   * Layout for a control carrying a leading adornment.
   *
   * Note what is NOT here: horizontal padding. The adornment's inset is a
   * margin on the adornment and the text's is padding on the input, so this
   * view still has no padding for an Android background change to reset — the
   * same reason the box and the input are separate views in the first place.
   */
  controlWithLeading: { flexDirection: 'row', alignItems: 'center' },
  /** left-[14px] plus a 20pt glyph, so text starts at 44 — web's `pl-11`. */
  leading: { marginLeft: 14 },
  inputWithLeading: { flex: 1, paddingLeft: 10 },
  controlFocused: {
    borderColor: theme.colors.teal[500],
    boxShadow: [theme.shadows.focusRingTeal],
  },
  // Error outranks focus on web — the error branch of the cva has no focus
  // variant at all, so an invalid field keeps its red ring while focused.
  controlError: {
    borderColor: theme.colors.error,
    boxShadow: [theme.shadows.focusRingError],
  },
  label: {
    marginBottom: 7,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    color: theme.colors.label,
  },
  message: {
    marginTop: 4,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
  },
  messageError: { color: theme.colors.error },
  messageHelper: { color: theme.colors.slate },
}))
