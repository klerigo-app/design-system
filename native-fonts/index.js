/**
 * The brand fonts, as a map React Native font loaders accept directly.
 *
 *   import { useFonts } from 'expo-font'
 *   import { klerigoFonts } from '@klerigo/design-system/native-fonts'
 *
 *   const [loaded] = useFonts(klerigoFonts)
 *
 * This package takes no dependency on expo-font. Owning font loading end to end
 * would mean the design system dictating that its consumers are Expo apps; its
 * peers are react and react-dom, and should stay that way. The app registers
 * these; the design system only says what they are.
 *
 * Why this file lives at the repo root rather than in src/native: the /native
 * entry is a Vite lib entry (vite.config.ts), and Vite's asset pipeline would
 * rewrite these require() calls, destroying the Metro semantics that make them
 * resolve to bundled assets. Same reason tailwind-preset.js sits here.
 *
 * The keys are the family names components pass to `fontFamily`, so they cannot
 * drift from the styles: src/native/fonts.ts holds the same strings, and
 * src/native/fonts.test.ts checks both against the files on disk.
 *
 * CommonJS, matching tailwind-preset.js. Metro's interop makes the named import
 * above work regardless.
 */
module.exports.klerigoFonts = {
  // Display — headings and every button label.
  'Baloo2-Regular': require('./Baloo2-Regular.ttf'),
  'Baloo2-Medium': require('./Baloo2-Medium.ttf'),
  'Baloo2-SemiBold': require('./Baloo2-SemiBold.ttf'),
  'Baloo2-Bold': require('./Baloo2-Bold.ttf'),

  // Body — text, field controls, labels and messages.
  'DMSans-Regular': require('./DMSans-Regular.ttf'),
  'DMSans-Medium': require('./DMSans-Medium.ttf'),
  'DMSans-SemiBold': require('./DMSans-SemiBold.ttf'),
  'DMSans-Bold': require('./DMSans-Bold.ttf'),

  // Mono — shipped for parity with fonts.css; no native component uses it yet.
  'DMMono-Regular': require('./DMMono-Regular.ttf'),
  'DMMono-Medium': require('./DMMono-Medium.ttf'),
}
