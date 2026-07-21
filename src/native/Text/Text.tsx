import { type ReactElement } from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

export interface HeadingProps extends RNTextProps {
  size?: 'md' | 'lg'
}

// Explicit return type: without it, tsc's declaration emit infers `JSX.Element`
// and references @types/react via a path that isn't portable when this package
// is built as a git dependency in a consumer's pnpm store (TS2883).
/** Display-scale heading in ink. Sizes mirror the web Heading scale. */
export function Heading({ size = 'lg', style, ...props }: HeadingProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  return (
    <RNText style={[styles.heading, size === 'lg' ? styles.lg : styles.md, style]} {...props} />
  )
}

export interface BodyTextProps extends RNTextProps {
  variant?: 'body' | 'muted'
}

/** Body copy. `muted` is the secondary slate tone used for subtitles/captions. */
export function Text({ variant = 'body', style, ...props }: BodyTextProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  return <RNText style={[variant === 'muted' ? styles.muted : styles.body, style]} {...props} />
}

const themedStyles = createThemedStyles((theme) => ({
  // Baloo2-Medium already IS weight 500 — web's display type is
  // `font-display font-medium` throughout (Heading.tsx:13), where native used
  // 700 before the fonts existed.
  //
  // No fontWeight alongside it, deliberately. With per-weight family names, a
  // fontFamily + fontWeight pair can miss the registered face on Android and
  // drop to the system font. Naming the family alone is the reliable form, and
  // it also keeps a failed font registration visible rather than approximating
  // it with a synthesised system weight — which is what the emulator pass is
  // there to catch.
  heading: { fontFamily: fontFamily.display, color: theme.colors.ink },
  lg: { fontSize: 24 },
  md: { fontSize: 20 },
  body: { fontFamily: fontFamily.body, fontSize: 16, color: theme.colors.ink },
  muted: { fontFamily: fontFamily.body, fontSize: 16, color: theme.colors.slate },
}))
