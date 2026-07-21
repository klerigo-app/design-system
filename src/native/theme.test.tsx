import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { View, styleOf, __setColorScheme } from './__test__/rn-stub'
import { getPalette, getShadows } from '../tokens/tokens'
import { ThemeProvider, useTheme, createThemedStyles, useThemedStyles, type Theme } from './theme'

const styles = createThemedStyles((t) => ({
  box: { backgroundColor: t.colors.paper, color: t.colors.ink },
}))

function Box() {
  const s = useThemedStyles(styles)
  return <View testID="box" style={s.box} />
}

const boxStyle = () => styleOf(screen.getByTestId('box'))

afterEach(() => __setColorScheme('light'))

describe('ThemeProvider', () => {
  it('follows the OS scheme when uncontrolled', () => {
    __setColorScheme('dark')
    render(
      <ThemeProvider>
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().backgroundColor).toBe(getPalette('dark').paper)
  })

  it('lets an explicit scheme override the OS, in both directions', () => {
    __setColorScheme('dark')
    const { unmount } = render(
      <ThemeProvider scheme="light">
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().backgroundColor).toBe(getPalette('light').paper)
    unmount()

    __setColorScheme('light')
    render(
      <ThemeProvider scheme="dark">
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().backgroundColor).toBe(getPalette('dark').paper)
  })

  it('treats an unknown OS scheme as light', () => {
    __setColorScheme(null)
    render(
      <ThemeProvider>
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().backgroundColor).toBe(getPalette('light').paper)
  })

  it('restyles in place when the scheme changes', () => {
    const { rerender } = render(
      <ThemeProvider scheme="light">
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().color).toBe(getPalette('light').ink)

    rerender(
      <ThemeProvider scheme="dark">
        <Box />
      </ThemeProvider>,
    )
    expect(boxStyle().color).toBe(getPalette('dark').ink)
  })
})

describe('useTheme', () => {
  it('throws outside a provider, rather than defaulting to light', () => {
    // A silent light fallback is how the frozen-palette bug hid for so long.
    expect(() => render(<Box />)).toThrow(/must be used within a <ThemeProvider>/)
  })

  it('hands back the palette for the active scheme', () => {
    function Probe() {
      return <View testID="probe" style={{ backgroundColor: useTheme().colors.surfaceRaised }} />
    }
    render(
      <ThemeProvider scheme="dark">
        <Probe />
      </ThemeProvider>,
    )
    expect(styleOf(screen.getByTestId('probe')).backgroundColor).toBe(
      getPalette('dark').surfaceRaised,
    )
  })

  it('carries the shadow scale alongside the colours, and flips it too', () => {
    // The shadows axis is the whole reason useTheme returns an object rather
    // than a bare palette. A shadow that stays light on a dark surface is the
    // same class of bug the colours had.
    const seen: string[] = []
    function Probe() {
      seen.push(useTheme().shadows.buttonLiftCoral.color)
      return null
    }
    for (const scheme of ['light', 'dark'] as const) {
      const { unmount } = render(
        <ThemeProvider scheme={scheme}>
          <Probe />
        </ThemeProvider>,
      )
      unmount()
    }
    expect(seen).toEqual([
      getShadows('light').buttonLiftCoral.color,
      getShadows('dark').buttonLiftCoral.color,
    ])
    expect(seen[0]).not.toBe(seen[1])
  })
})

describe('createThemedStyles', () => {
  it('builds each scheme once, however many components read it', () => {
    let builds = 0
    const counted = createThemedStyles((t) => {
      builds++
      return { box: { backgroundColor: t.colors.paper } }
    })
    function Counted() {
      useThemedStyles(counted)
      return null
    }

    render(
      <ThemeProvider scheme="light">
        <Counted />
        <Counted />
        <Counted />
      </ThemeProvider>,
    )
    expect(builds).toBe(1)

    render(
      <ThemeProvider scheme="dark">
        <Counted />
        <Counted />
      </ThemeProvider>,
    )
    expect(builds).toBe(2)
  })

  it('returns the identical object for repeat resolutions of a scheme', () => {
    // The cache keys on theme identity, so these have to be stable objects —
    // which is exactly the contract ThemeProvider's useMemo upholds.
    const theme = (scheme: 'light' | 'dark'): Theme => ({
      colors: getPalette(scheme),
      shadows: getShadows(scheme),
    })
    const [light, dark] = [theme('light'), theme('dark')]
    expect(styles.resolve(light)).toBe(styles.resolve(light))
    expect(styles.resolve(light)).not.toBe(styles.resolve(dark))
  })
})
