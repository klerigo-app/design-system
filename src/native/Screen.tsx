import { type ReactElement, type ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { colors } from '../tokens/tokens'

// Matches the apps' `px-6` screen gutter (Tailwind 6 * 4px = 24).
const SCREEN_GUTTER = 24

export interface ScreenProps {
  children: ReactNode
  /** Vertically (and horizontally) center the content, e.g. for auth screens. */
  center?: boolean
  style?: ViewStyle
}

/**
 * Standard screen container: paper background with the app's horizontal
 * padding. Replaces the repeated `flex-1 bg-paper px-6` shells.
 */
export function Screen({ children, center, style }: ScreenProps): ReactElement {
  return <View style={[styles.screen, center && styles.center, style]}>{children}</View>
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: SCREEN_GUTTER,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
})
