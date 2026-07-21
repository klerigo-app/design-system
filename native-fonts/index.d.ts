/**
 * Metro resolves a `require()` of a .ttf to an opaque numeric asset handle, so
 * the values are typed `number` — which is what makes this map assignable to
 * `expo-font`'s `FontSource` and usable directly:
 *
 *   useFonts(klerigoFonts)
 *   Font.loadAsync(klerigoFonts)
 *
 * (`unknown` would be more honest about the handle being opaque, and was the
 * first attempt, but it forces every caller to cast — which defeats the point
 * of shipping the map at all.)
 */
export declare const klerigoFonts: Record<KlerigoFontFamily, number>

/** Every family name registered by `klerigoFonts`, and accepted by `fontFamily`. */
export type KlerigoFontFamily =
  | 'Baloo2-Regular'
  | 'Baloo2-Medium'
  | 'Baloo2-SemiBold'
  | 'Baloo2-Bold'
  | 'DMSans-Regular'
  | 'DMSans-Medium'
  | 'DMSans-SemiBold'
  | 'DMSans-Bold'
  | 'DMMono-Regular'
  | 'DMMono-Medium'
