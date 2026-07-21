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
export * from './fonts'
export * from './Screen'
export * from './Text'
export * from './Field'
export * from './Modal'
export * from './Toast'

// Six variants, one component each, mirroring web's Button variants. ButtonBase
// is deliberately not exported: it is how they share geometry, not API.
export * from './PrimaryButton'
export * from './RewardButton'
export * from './SecondaryButton'
export * from './OutlineButton'
export * from './GhostButton'
export * from './DangerButton'

// Re-export tokens so RN consumers have one import site. There is deliberately
// no standing palette or shadow export: read both through `useTheme` /
// `useThemedStyles` so they follow the active scheme instead of freezing at
// import time. `getPalette`/`getShadows` are here for the cases that genuinely
// have no theme context, such as a navigator configured outside the provider.
export { getPalette, getShadows, radii, radiusValue } from '../tokens/tokens'
export type { ColorScheme, Palette, Shadows, ShadowValue } from '../tokens/tokens'

// tokens.ts declares ShadowValue structurally rather than importing RN's type,
// so that the token entry stays consumable by CommonJS Tailwind configs. This is
// where the two are tied together: if RN's BoxShadowValue ever stops accepting
// our shape, this fails to compile here rather than silently at a call site.
// Type-only, so nothing is emitted.
import type { BoxShadowValue } from 'react-native'
import type { ShadowValue as _ShadowValue } from '../tokens/tokens'
type _AssertShadowValueIsBoxShadow = _ShadowValue extends BoxShadowValue ? true : never
const _shadowShapeIsCompatible: _AssertShadowValueIsBoxShadow = true
void _shadowShapeIsCompatible
