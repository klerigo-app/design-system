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
 *   import { Screen, Field, PrimaryButton } from '@espanolenka/design-system/native'
 */
export * from './Screen'
export * from './Text'
export * from './Field'
export * from './PrimaryButton'
export * from './SecondaryButton'
export * from './Modal'

// Re-export tokens so RN consumers have one import site.
export { colors, radii, radiusValue, shadows } from '../tokens/tokens'
