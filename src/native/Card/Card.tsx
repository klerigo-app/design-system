import { type ReactElement, type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { createThemedStyles, useThemedStyles } from '../theme'

export type CardVariant = 'flat' | 'elevated' | 'feature'

// Extends ViewProps for the same reason web's CardProps extends
// HTMLAttributes: a container that cannot take a testID or an accessibility
// prop makes every caller wrap it in another View.
export interface CardProps extends ViewProps {
  variant?: CardVariant
  /**
   * The sun-coloured disc bleeding off the top-right corner. `feature` only —
   * the other two variants have nothing to bleed over.
   */
  decorativeCircle?: boolean
  children?: ReactNode
}

/**
 * The standard content container: settings groups, preference panels, anything
 * that needs a bounded surface.
 *
 * Web's `interactive` prop has no counterpart here. Its only effect is
 * `hover:-translate-y-1`, and a phone has no hover; a press treatment would be
 * a different behaviour rather than a port of that one, so it is left out until
 * a screen actually asks. The variant union is otherwise identical to web's, so
 * a screen can move between platforms without hitting a type error.
 *
 * `feature` sets the inverse surface but does not recolour its children, and
 * that matches web rather than falling short of it. Web's `text-white` only
 * reaches bare text nodes — a `<Text>` child brings its own `text-ink` and wins
 * — and React Native has no bare text nodes at all, since a string must be
 * inside a `<Text>`. Either way the caller styles the copy on this surface.
 */
export function Card({
  variant = 'flat',
  decorativeCircle = false,
  style,
  children,
  ...props
}: CardProps): ReactElement {
  const styles = useThemedStyles(themedStyles)

  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {variant === 'feature' && decorativeCircle ? (
        // Before the children so it paints underneath them. React Native has no
        // z-index-free stacking guarantee the way CSS does, and the web version
        // leans on source order for exactly the same reason.
        <View pointerEvents="none" style={styles.circle} />
      ) : null}
      {children}
    </View>
  )
}

const themedStyles = createThemedStyles((theme) => ({
  // rounded-xl (20) and p-6 (24), from web's cardStyles base.
  base: { borderRadius: radiusValue.xl, padding: 24 },

  flat: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
  },
  elevated: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    boxShadow: [theme.shadows.cardElevated],
  },
  /**
   * `overflow: 'hidden'` is what clips the disc back to the card's rounded
   * corner — web gets it from the same `overflow-hidden` on this variant.
   */
  feature: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceInverse,
  },
  /**
   * 160x160 at -32/-32, matching web's `-right-8 -top-8 h-40 w-40`. The 0.17
   * opacity is on the view rather than baked into the colour because sun-500 is
   * a token and an rgba() of it would not be.
   */
  circle: {
    position: 'absolute',
    top: -32,
    right: -32,
    height: 160,
    width: 160,
    borderRadius: radiusValue.pill,
    backgroundColor: theme.colors.sun[500],
    opacity: 0.17,
  },
}))
