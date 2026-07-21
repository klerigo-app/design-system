import { createContext, useContext, useMemo, type ReactElement, type ReactNode } from 'react'
import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import {
  getPalette,
  getShadows,
  type ColorScheme,
  type Palette,
  type Shadows,
} from '../tokens/tokens'

/**
 * Everything a component needs to style itself for the active scheme.
 *
 * An object rather than extra positional arguments to `createThemedStyles`: a
 * second axis is tolerable positionally, a third is not, and `boxShadow` belongs
 * inside the stylesheet rather than spread at the call site.
 */
export interface Theme {
  readonly colors: Palette
  readonly shadows: Shadows
}

const ThemeContext = createContext<Theme | null>(null)

export interface ThemeProviderProps {
  children: ReactNode
  /**
   * Force a scheme instead of following the OS. Mirrors the web layer, where
   * `data-theme` on the root element wins over `prefers-color-scheme` in both
   * directions.
   */
  scheme?: ColorScheme
}

/**
 * Supplies the active palette to every design-system component beneath it.
 *
 * Uncontrolled, it follows the OS via `useColorScheme()`. Note that returns
 * 'light' unconditionally unless the app sets `userInterfaceStyle: "automatic"`
 * in app.json — on a prebuilt Android project that is a native-config change,
 * not a JS one.
 *
 * Persisting a user's choice is deliberately not handled here: reading it back
 * is async, so it belongs with the app's splash-screen gate rather than in this
 * package, which would otherwise flash the wrong theme on every cold start.
 * Pass the restored value in via `scheme`.
 */
export function ThemeProvider({ children, scheme }: ThemeProviderProps): ReactElement {
  const osScheme = useColorScheme()
  const active = scheme ?? (osScheme === 'dark' ? 'dark' : 'light')
  // Memoised on the scheme, so the theme keeps a stable identity for as long as
  // the scheme does — which is what makes the style cache below viable.
  const theme = useMemo<Theme>(
    () => ({ colors: getPalette(active), shadows: getShadows(active) }),
    [active],
  )

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

/** The active theme. Must be called under a `<ThemeProvider>`. */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('useTheme must be used within a <ThemeProvider>')
  }
  return theme
}

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>

/**
 * A stylesheet that has not picked a scheme yet. Opaque on purpose — the only
 * way to read it is `useThemedStyles`, which resolves it against the active
 * theme, so there is no module-scope path back to a frozen palette.
 */
export interface ThemedStyles<T extends NamedStyles> {
  readonly resolve: (theme: Theme) => T
}

/**
 * Declare a component's styles as a function of the palette.
 *
 * Replaces a module-scope `StyleSheet.create`, which captures colours once at
 * import time and can never flip. Shape is otherwise unchanged: one styles
 * block per file, read through one hook call.
 */
export function createThemedStyles<T extends NamedStyles>(
  build: (theme: Theme) => T,
): ThemedStyles<T> {
  // Keyed by theme identity, so each stylesheet is built at most once per scheme
  // for the life of the process rather than once per component instance. Relies
  // on ThemeProvider memoising the theme per scheme.
  const cache = new Map<Theme, T>()
  return {
    resolve(theme) {
      let styles = cache.get(theme)
      if (!styles) {
        styles = StyleSheet.create(build(theme))
        cache.set(theme, styles)
      }
      return styles
    },
  }
}

/** Resolve themed styles against the active theme. */
export function useThemedStyles<T extends NamedStyles>(styles: ThemedStyles<T>): T {
  return styles.resolve(useTheme())
}
