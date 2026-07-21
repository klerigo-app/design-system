import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { View, styleOf, __setColorScheme } from './__test__/rn-stub'
import { getPalette } from '../tokens/tokens'
import { ThemeProvider, useTheme, createThemedStyles, useThemedStyles } from './theme'

const styles = createThemedStyles((p) => ({
  box: { backgroundColor: p.paper, color: p.ink },
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
      return <View testID="probe" style={{ backgroundColor: useTheme().surfaceRaised }} />
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
})

describe('createThemedStyles', () => {
  it('builds each scheme once, however many components read it', () => {
    let builds = 0
    const counted = createThemedStyles((p) => {
      builds++
      return { box: { backgroundColor: p.paper } }
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
    const light = getPalette('light')
    expect(styles.resolve(light)).toBe(styles.resolve(light))
    expect(styles.resolve(light)).not.toBe(styles.resolve(getPalette('dark')))
  })
})
