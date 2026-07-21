import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { type ReactElement } from 'react'
import { styleOf } from './__test__/rn-stub'
import { getPalette, getShadows, type ColorScheme, type Palette } from '../tokens/tokens'
import { fontFamily } from './fonts'
import { ThemeProvider } from './theme'
import { Screen } from './Screen'
import { Heading, Text } from './Text'
import { Field } from './Field'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'
import { Modal } from './Modal'
import { ToastProvider, useToast } from './Toast'

const inScheme = (scheme: ColorScheme, ui: ReactElement) =>
  render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>)

/**
 * Render the same component in both schemes and hand each result to an
 * assertion. Every component gets this treatment: a colour that is right in
 * light and unchanged in dark is exactly the bug this all exists to prevent, so
 * asserting one scheme in isolation would not catch it.
 */
function bothSchemes(ui: ReactElement, assert: (palette: Palette, scheme: ColorScheme) => void) {
  for (const scheme of ['light', 'dark'] as const) {
    const { unmount } = inScheme(scheme, ui)
    assert(getPalette(scheme), scheme)
    unmount()
  }
}

const style = (testId: string) => styleOf(screen.getByTestId(testId))

describe('Screen', () => {
  it('paints the paper background of the active scheme', () => {
    bothSchemes(
      <Screen>
        <Text testID="child">hi</Text>
      </Screen>,
      (palette) => {
        // Screen renders no testID of its own; its View is the child's parent.
        const view = screen.getByTestId('child').parentElement!
        expect(styleOf(view).backgroundColor).toBe(palette.paper)
      },
    )
  })
})

describe('Text', () => {
  it('renders headings and body in ink, muted in slate', () => {
    bothSchemes(
      <>
        <Heading testID="heading">Title</Heading>
        <Text testID="body">Body</Text>
        <Text testID="muted" variant="muted">
          Caption
        </Text>
      </>,
      (palette) => {
        expect(style('heading').color).toBe(palette.ink)
        expect(style('body').color).toBe(palette.ink)
        expect(style('muted').color).toBe(palette.slate)
      },
    )
  })

  it('sets the brand families, since RN falls back to the system font in silence', () => {
    // The failure this catches has no error and no tofu — just subtly wrong
    // type. Nothing else in the suite would notice.
    inScheme(
      'light',
      <>
        <Heading testID="heading">Title</Heading>
        <Text testID="body">Body</Text>
        <Text testID="muted" variant="muted">
          Caption
        </Text>
      </>,
    )
    expect(style('heading').fontFamily).toBe(fontFamily.display)
    expect(style('body').fontFamily).toBe(fontFamily.body)
    expect(style('muted').fontFamily).toBe(fontFamily.body)
  })

  it('renders headings at 500, not the 700 that predated the fonts', () => {
    // Web's display type is font-medium throughout; 700 was native drifting.
    inScheme('light', <Heading testID="heading">Title</Heading>)
    expect(style('heading').fontWeight).toBe('500')
  })
})

describe('Field', () => {
  it('themes text, border, and the placeholder prop', () => {
    bothSchemes(<Field testID="field" />, (palette) => {
      expect(style('field').color).toBe(palette.ink)
      expect(style('field').borderColor).toBe(palette.slate)
      // placeholderTextColor is a prop, not a style — easy to leave frozen.
      expect(screen.getByTestId('field').getAttribute('data-placeholder-color')).toBe(palette.muted)
    })
  })
})

describe('PrimaryButton', () => {
  it('keeps the vivid coral fill in both schemes', () => {
    bothSchemes(<PrimaryButton testID="btn" label="Go" />, (palette) => {
      expect(style('btn').backgroundColor).toBe(palette.coral[500])
    })
  })
})

describe('SecondaryButton', () => {
  it('themes its outline and label', () => {
    bothSchemes(<SecondaryButton testID="btn" label="Log out" />, (palette) => {
      expect(style('btn').borderColor).toBe(palette.slate)
    })
  })
})

describe('Modal', () => {
  const modal = (
    <Modal isOpen title="Delete?" onClose={() => {}} onConfirm={() => {}} variant="error" />
  )

  it('raises the card on the themed surface, not white', () => {
    bothSchemes(modal, (palette) => {
      const card = screen.getByText('Delete?').parentElement!
      expect(styleOf(card).backgroundColor).toBe(palette.surfaceRaised)
    })
  })

  it('draws the scrim from the scrim token', () => {
    bothSchemes(modal, (palette) => {
      const overlay = screen.getByTestId('modal').firstElementChild!
      expect(styleOf(overlay).backgroundColor).toBe(`${palette.scrim}99`)
    })
  })

  it('uses pure black behind the card in dark, lifted ink in light', () => {
    // Guards the reason scrim is its own token rather than an alias of ink.
    expect(getPalette('dark').scrim).toBe('#000000')
    expect(getPalette('light').scrim).not.toBe(getPalette('dark').scrim)
  })
})

describe('Toast', () => {
  function Trigger() {
    const { toast } = useToast()
    return (
      <PrimaryButton
        testID="fire"
        label="Fire"
        onPress={() => toast({ title: 'Saved', variant: 'success' })}
      />
    )
  }

  it('themes the toast card surface and border', () => {
    bothSchemes(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
      (palette) => {
        act(() => screen.getByTestId('fire').click())
        expect(style('toast-card').backgroundColor).toBe(palette.surfaceRaised)
        expect(style('toast-card').borderColor).toBe(palette.border)
      },
    )
  })

  it('draws its elevation from the themed shadow scale, not a hardcoded brown', () => {
    // This card used to carry shadowColor: '#5A3C1E' with a standing exemption
    // in themed-source.test.ts, because the token layer had no shadow RN could
    // consume. It does now, so the warm brown must not come back.
    bothSchemes(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
      (_palette, scheme) => {
        act(() => screen.getByTestId('fire').click())
        expect(style('toast-card').boxShadow).toEqual([getShadows(scheme).cardElevated])
        expect(style('toast-card').shadowColor).toBeUndefined()
        expect(style('toast-card').elevation).toBeUndefined()
      },
    )
  })
})
