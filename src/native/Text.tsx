import { type ReactElement } from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { createThemedStyles, useThemedStyles } from './theme'

export interface HeadingProps extends RNTextProps {
  size?: 'md' | 'lg'
}

// Explicit return type: without it, tsc's declaration emit infers `JSX.Element`
// and references @types/react via a path that isn't portable when this package
// is built as a git dependency in a consumer's pnpm store (TS2883).
/** Bold display-scale heading in ink. Sizes mirror the web Heading scale. */
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

const themedStyles = createThemedStyles((palette) => ({
  heading: { fontWeight: '700', color: palette.ink },
  lg: { fontSize: 24 },
  md: { fontSize: 20 },
  body: { fontSize: 16, color: palette.ink },
  muted: { fontSize: 16, color: palette.slate },
}))
