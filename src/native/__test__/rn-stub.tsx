/**
 * Stand-in for `react-native` under Vitest.
 *
 * The real package cannot be imported here: it ships Flow-typed source that
 * rolldown fails to parse, and the usual escape hatch — react-test-renderer via
 * @testing-library/react-native — is deprecated on React 19, which this package
 * builds against. So the native components are rendered to the DOM through
 * @testing-library/react with these primitives aliased in (see vite.config.ts).
 *
 * What that does and does not prove: style objects reach elements with the
 * values the active theme dictates, and they change when the theme changes.
 * It says nothing about how React Native itself lays them out — that is what
 * the emulator pass on the consuming apps is for.
 */
import { forwardRef, type ReactNode } from 'react'

export type ViewStyle = Record<string, unknown>
export type TextStyle = Record<string, unknown>
export type ImageStyle = Record<string, unknown>

type Style = ViewStyle | TextStyle | ImageStyle | false | null | undefined | Style[]

/** Mirrors RN's flattening of `style={[a, cond && b]}` arrays. */
function flatten(style: Style): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten))
  if (!style) return {}
  return style as Record<string, unknown>
}

/**
 * Styles are serialised onto a data attribute rather than mapped to CSS: the
 * assertions are about token values (`backgroundColor: '#181310'`), and going
 * through the DOM's style parser would normalise hex to rgb() and silently drop
 * RN-only properties.
 */
function styleProps(style: Style) {
  return { 'data-style': JSON.stringify(flatten(style)) }
}

/** Read back what a component computed for an element. */
export function styleOf(element: Element): Record<string, unknown> {
  return JSON.parse(element.getAttribute('data-style') ?? '{}')
}

interface HostProps {
  children?: ReactNode
  style?: Style
  testID?: string
  onPress?: () => void
  [key: string]: unknown
}

const host =
  (tag: 'div' | 'span' | 'button', role?: string) =>
  // eslint-disable-next-line react/display-name
  ({ children, style, testID, onPress, ...rest }: HostProps) => {
    const Tag = tag
    // RN props that are not DOM attributes are dropped rather than spread, so
    // React does not warn about unknown attributes on every render.
    const {
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      pointerEvents,
      accessibilityRole,
      accessibilityLabel,
      accessibilityLiveRegion,
      accessibilityState,
      hitSlop,
      ...domProps
    } = rest
    void [pointerEvents, hitSlop]
    return (
      <Tag
        data-testid={testID}
        role={(accessibilityRole as string) ?? role}
        aria-label={accessibilityLabel as string}
        aria-live={accessibilityLiveRegion as 'polite' | 'assertive'}
        aria-disabled={(accessibilityState as { disabled?: boolean })?.disabled || undefined}
        /**
         * Stops here rather than bubbling, emulating React Native's touch
         * responder system: exactly one view handles a touch, and an inner
         * Pressable claims it from the ones around it. The DOM has no such
         * rule, so without this a tap on a sheet row would also fire the
         * scrim's onPress behind it and dismiss the sheet — a failure that
         * exists only in this stub, and which Modal and optionSheet both
         * document relying on the real behaviour for.
         */
        onClick={
          onPress
            ? (event: { stopPropagation: () => void }) => {
                event.stopPropagation()
                ;(onPress as () => void)()
              }
            : undefined
        }
        // Press and hover are mapped to the nearest DOM events so the pressed
        // and hovered style branches can be exercised at all. Without this a
        // button's rest state is the only thing any test can see — and the
        // pressed shadow and 3px sink are precisely the parts most likely to be
        // wrong. It still proves only that the right style object is produced,
        // not that RN honours it.
        onMouseDown={onPressIn as () => void}
        onMouseUp={onPressOut as () => void}
        onMouseEnter={onHoverIn as () => void}
        onMouseLeave={onHoverOut as () => void}
        {...styleProps(style)}
        {...(domProps as object)}
      >
        {children}
      </Tag>
    )
  }

export const View = host('div')
export const Text = host('span')
export const Pressable = host('button')
export const ScrollView = host('div')
export const Modal = ({ children, visible = true }: HostProps & { visible?: boolean }) =>
  visible ? <div data-testid="modal">{children}</div> : null

export const TextInput = forwardRef<
  HTMLInputElement,
  HostProps & { placeholderTextColor?: string }
>(({ style, testID, placeholderTextColor, ...rest }, ref) => {
  // Accessibility props are mapped rather than spread, matching host() above.
  // Spreading them raw puts `accessibilityLabel` on the DOM node as an unknown
  // attribute, which React warns about and no assertion can sensibly read.
  // accessibilityHint has no DOM equivalent, so it gets a data attribute.
  const { accessibilityLabel, accessibilityHint, ...domProps } = rest
  return (
    <input
      ref={ref}
      data-testid={testID}
      data-placeholder-color={placeholderTextColor as string}
      aria-label={accessibilityLabel as string}
      data-hint={accessibilityHint as string}
      {...styleProps(style as Style)}
      {...(domProps as object)}
    />
  )
})
TextInput.displayName = 'TextInput'

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
  flatten,
  absoluteFillObject: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  hairlineWidth: 1,
}

/**
 * Overridable OS scheme. RN reads this from the platform; tests set it directly
 * to exercise the uncontrolled ThemeProvider path.
 */
let osColorScheme: 'light' | 'dark' | null = 'light'
export const useColorScheme = () => osColorScheme
export const __setColorScheme = (scheme: 'light' | 'dark' | null) => {
  osColorScheme = scheme
}

export const Animated = {
  View: host('div'),
  Text: host('span'),
  Value: class {
    value: number
    constructor(value: number) {
      this.value = value
    }
    setValue(v: number) {
      this.value = v
    }
    interpolate() {
      return this
    }
  },
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  parallel: () => ({ start: (cb?: () => void) => cb?.() }),
  sequence: () => ({ start: (cb?: () => void) => cb?.() }),
}

export const AccessibilityInfo = {
  announceForAccessibility: () => {},
  isReduceMotionEnabled: () => Promise.resolve(false),
}

export const Platform = {
  OS: 'ios' as const,
  select: (o: Record<string, unknown>) => o.ios ?? o.default,
}
export const Dimensions = { get: () => ({ width: 390, height: 844 }) }
