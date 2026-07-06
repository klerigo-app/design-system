import { type ReactElement } from 'react'
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'
import { colors } from '../tokens/tokens'

export interface HeadingProps extends RNTextProps {
  size?: 'md' | 'lg'
}

// Explicit return type: without it, tsc's declaration emit infers `JSX.Element`
// and references @types/react via a path that isn't portable when this package
// is built as a git dependency in a consumer's pnpm store (TS2883).
/** Bold display-scale heading in ink. Sizes mirror the web Heading scale. */
export function Heading({ size = 'lg', style, ...props }: HeadingProps): ReactElement {
  return (
    <RNText style={[styles.heading, size === 'lg' ? styles.lg : styles.md, style]} {...props} />
  )
}

export interface BodyTextProps extends RNTextProps {
  variant?: 'body' | 'muted'
}

/** Body copy. `muted` is the secondary slate tone used for subtitles/captions. */
export function Text({ variant = 'body', style, ...props }: BodyTextProps): ReactElement {
  return <RNText style={[variant === 'muted' ? styles.muted : styles.body, style]} {...props} />
}

const styles = StyleSheet.create({
  heading: { fontWeight: '700', color: colors.ink },
  lg: { fontSize: 24 },
  md: { fontSize: 20 },
  body: { fontSize: 16, color: colors.ink },
  muted: { fontSize: 16, color: colors.slate },
})
