import { useState, type ReactElement, type ReactNode } from 'react'
import {
  Pressable,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { radiusValue, type ShadowValue } from '../tokens/tokens'
import { fontFamily } from './fonts'
import { createThemedStyles, useTheme, useThemedStyles, type Theme } from './theme'

export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Everything that differs between the six button variants.
 *
 * Deliberately not just colours. Press behaviour is per-variant on web and has
 * to be here too: primary and reward carry the hard coloured lift and sink 3px,
 * danger sinks 1px with no shadow at all, and secondary/ghost/outline neither
 * lift nor sink (Button.tsx:27-33). A base that only took colours would have
 * every variant retrofitting its own press handling.
 */
export interface ButtonVisual {
  readonly backgroundColor: string
  readonly color: string
  readonly borderColor?: string
  readonly borderWidth?: number
  /** `*-hover` tokens, for iPad pointer and Android mouse. */
  readonly hoverBackgroundColor?: string
  readonly hoverColor?: string
  readonly restShadow?: ShadowValue
  readonly pressedShadow?: ShadowValue
  /** How far the button sinks while held, in dp. 0 for the flat variants. */
  readonly pressTranslate: number
}

/**
 * Disabled is a full substitution, not an overlay — matching web, where
 * `resolvedVariant = disabled ? 'disabled' : variant` (Button.tsx:75) throws the
 * variant's classes away entirely and the base adds `disabled:shadow-none`.
 *
 * So a disabled ghost or outline button is a solid grey box rather than a
 * greyed-out outline. That is web's behaviour, and it follows #5, which moved
 * the web Checkbox off opacity onto these tokens. Native buttons used
 * `opacity: 0.6`, which reads differently over light and dark surfaces; this
 * removes the last opacity-based state in the package.
 */
const disabledVisual = (theme: Theme): ButtonVisual => ({
  backgroundColor: theme.colors.disabledBg,
  color: theme.colors.disabledText,
  pressTranslate: 0,
})

export interface ButtonBaseOwnProps {
  /**
   * Button text. A string rather than `children`: React Native requires text be
   * wrapped in <Text>, so a children API would either wrap blindly or document
   * a constraint web does not have.
   */
  label: string
  size?: ButtonSize
  fullWidth?: boolean
  /**
   * Leading icon, 20x20. The design system ships the slot and the layout but
   * not the glyphs — @phosphor-icons/react is web-only, so the app supplies it.
   */
  icon?: ReactNode
  style?: StyleProp<ViewStyle>
}

export type ButtonBaseProps = ButtonBaseOwnProps &
  Omit<PressableProps, 'children' | 'style' | keyof ButtonBaseOwnProps>

interface Props extends ButtonBaseProps {
  visual: (theme: Theme) => ButtonVisual
}

/**
 * Shared geometry, press wiring and icon slot for the six button variants.
 *
 * Not exported from index.ts — it is an implementation detail of the variants.
 * It is a flat file rather than a directory on purpose: themed-source.test.ts
 * scans src/native non-recursively, so anything in a subdirectory would escape
 * the frozen-palette and hardcoded-hex guards.
 */
export function ButtonBase({
  label,
  size = 'md',
  fullWidth = false,
  icon,
  visual,
  disabled,
  style,
  ...rest
}: Props): ReactElement {
  const theme = useTheme()
  const styles = useThemedStyles(themedStyles)
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const v = disabled ? disabledVisual(theme) : visual(theme)
  const shadow = pressed ? v.pressedShadow : v.restShadow

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.base,
        styles[size],
        fullWidth && styles.fullWidth,
        {
          backgroundColor:
            hovered && !pressed && v.hoverBackgroundColor
              ? v.hoverBackgroundColor
              : v.backgroundColor,
          ...(v.borderWidth ? { borderWidth: v.borderWidth, borderColor: v.borderColor } : null),
          ...(shadow ? { boxShadow: [shadow] } : null),
          // A transform rather than margin or top: it must not nudge whatever
          // sits below the button. (Web avoids `translate` utilities per #7, but
          // that was a Tailwind --tw-* variable problem; RN has no such
          // indirection and transform is the primitive here.)
          ...(pressed && v.pressTranslate
            ? { transform: [{ translateY: v.pressTranslate }] }
            : null),
        },
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <RNText
        style={[
          styles.label,
          styles[`${size}Label`],
          { color: hovered ? (v.hoverColor ?? v.color) : v.color },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  )
}

// Sizes take web's values exactly (Button.tsx:37-39). Note `sm` uses
// `rounded-md`, not `rounded-sm` — the radius scale and the size scale are
// offset by one. Native's previous 16x12 matched no web size.
const themedStyles = createThemedStyles(() => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  icon: { height: 20, width: 20, flexShrink: 0 },
  // Family only, no fontWeight — see the note in Text.tsx: with per-weight
  // family names the pair can miss the registered face on Android.
  label: { fontFamily: fontFamily.display },

  sm: { borderRadius: radiusValue.md, paddingHorizontal: 16, paddingVertical: 8 },
  md: { borderRadius: radiusValue.lg, paddingHorizontal: 26, paddingVertical: 14 },
  lg: { borderRadius: radiusValue.xl, paddingHorizontal: 34, paddingVertical: 18 },

  smLabel: { fontSize: 13 },
  mdLabel: { fontSize: 16 },
  lgLabel: { fontSize: 18 },
}))
