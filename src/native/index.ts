/**
 * React Native entry point for the design system.
 *
 * These components are styled with React Native StyleSheet driven by the
 * shared design tokens (not NativeWind className), so they render correctly
 * when imported from a prebuilt package without the consuming app needing to
 * run its NativeWind transform over node_modules. Screens can still use
 * NativeWind className for their own layout.
 *
 * Import from the dedicated subpath so Metro never pulls in the DOM entry
 * (which imports tokens.css and breaks bundling):
 *
 *   import { Screen, Field, PrimaryButton } from '@klerigo/design-system/native'
 */
export * from './theme'
export * from './Screen'
export * from './Text'
export * from './Field'
export * from './PrimaryButton'
export * from './SecondaryButton'
export * from './Modal'
export * from './Toast'

// Re-export tokens so RN consumers have one import site. There is deliberately
// no standing palette export: read colours through `useTheme` / `useThemedStyles`
// so they follow the active scheme instead of freezing at import time.
export { getPalette, radii, radiusValue, shadows } from '../tokens/tokens'
export type { ColorScheme, Palette } from '../tokens/tokens'
