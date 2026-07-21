import { describe, it, expect } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { type ReactElement } from 'react'
import { styleOf } from './__test__/rn-stub'
import { getPalette, getShadows, type ColorScheme, type Palette } from '../tokens/tokens'
import { fontFamily } from './fonts'
import { ThemeProvider } from './theme'
import { Screen } from './Screen'
import { Heading, Text } from './Text'
import { Field } from './Field'
import { TextInput } from './TextInput'
import { PrimaryButton } from './PrimaryButton'
import { RewardButton } from './RewardButton'
import { SecondaryButton } from './SecondaryButton'
import { OutlineButton } from './OutlineButton'
import { GhostButton } from './GhostButton'
import { DangerButton } from './DangerButton'
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

/**
 * A Field's border, surface and focus ring live on a wrapper View, not on the
 * TextInput — see fieldParts for why (Android resets a view's padding when its
 * background changes). testID stays on the input so callers can type into it,
 * so the box is its parent.
 */
const box = (testId: string) => styleOf(screen.getByTestId(testId).parentElement!)

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

  it('carries weight via the family, never a separate fontWeight', () => {
    // Baloo2-Medium IS 500 (web's display type is font-medium throughout; the
    // 700 native used before was drift). Setting fontWeight alongside a
    // per-weight family can miss the registered face on Android and silently
    // fall back to the system font, so the pair must not reappear.
    inScheme('light', <Heading testID="heading">Title</Heading>)
    expect(style('heading').fontFamily).toBe(fontFamily.display)
    expect(style('heading').fontWeight).toBeUndefined()
  })
})

describe('Field', () => {
  it('themes text, surface, border, and the placeholder prop', () => {
    bothSchemes(<Field testID="field" />, (palette) => {
      expect(style('field').color).toBe(palette.ink)
      // border-input, not slate — matching web's fieldControlStyles.
      expect(box('field').borderColor).toBe(palette.borderInput)
      expect(box('field').backgroundColor).toBe(palette.surfaceRaised)
      // placeholderTextColor is a prop, not a style — easy to leave frozen.
      expect(screen.getByTestId('field').getAttribute('data-placeholder-color')).toBe(palette.muted)
    })
  })

  it('matches the web field geometry rather than the old native one', () => {
    inScheme('light', <Field testID="field" />)
    // rounded-md (12) and 1.5px, not the lg (16) and 1px native had.
    expect(box('field').borderRadius).toBe(12)
    expect(box('field').borderWidth).toBe(1.5)
    expect(style('field').fontSize).toBe(15)
    expect(style('field').fontFamily).toBe(fontFamily.body)
    // The padding must sit on the input, never on the box that changes
    // background — that split is the whole point.
    expect(style('field').paddingHorizontal).toBe(16)
    expect(box('field').paddingHorizontal).toBeUndefined()
  })

  it('rings teal on focus and drops it on blur', () => {
    bothSchemes(<Field testID="field" />, (palette, scheme) => {
      const input = screen.getByTestId('field')
      expect(box('field').boxShadow).toBeUndefined()

      fireEvent.focus(input)
      expect(box('field').borderColor).toBe(palette.teal[500])
      expect(box('field').boxShadow).toEqual([getShadows(scheme).focusRingTeal])
      // Focusing must not disturb the input's padding.
      expect(style('field').paddingHorizontal).toBe(16)

      fireEvent.blur(input)
      expect(box('field').borderColor).toBe(palette.borderInput)
      expect(box('field').boxShadow).toBeUndefined()
    })
  })

  it('keeps the error ring while focused, because error outranks focus', () => {
    // Web's cva has no focus variant on the error branch, so an invalid field
    // must not turn teal when the user clicks back into it to fix it.
    bothSchemes(<Field testID="field" error />, (palette, scheme) => {
      expect(box('field').borderColor).toBe(palette.error)
      fireEvent.focus(screen.getByTestId('field'))
      expect(box('field').borderColor).toBe(palette.error)
      expect(box('field').boxShadow).toEqual([getShadows(scheme).focusRingError])
    })
  })

  it('still calls a caller-supplied onFocus/onBlur', () => {
    const events: string[] = []
    inScheme(
      'light',
      <Field
        testID="field"
        onFocus={() => events.push('focus')}
        onBlur={() => events.push('blur')}
      />,
    )
    fireEvent.focus(screen.getByTestId('field'))
    fireEvent.blur(screen.getByTestId('field'))
    expect(events).toEqual(['focus', 'blur'])
  })
})

describe('TextInput', () => {
  it('renders label, control, and one of error/helper', () => {
    inScheme('light', <TextInput testID="field" label="Email" helper="We never share it." />)
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('We never share it.')).toBeTruthy()
  })

  it('replaces the helper with the error, and puts the control in its error state', () => {
    bothSchemes(
      <TextInput testID="field" label="Email" helper="We never share it." error="Required" />,
      (palette) => {
        expect(screen.queryByText('We never share it.')).toBeNull()
        expect(styleOf(screen.getByText('Required')).color).toBe(palette.error)
        expect(box('field').borderColor).toBe(palette.error)
      },
    )
  })

  it('tones the helper in slate and the error in error', () => {
    bothSchemes(<TextInput testID="field" label="Email" helper="Optional" />, (palette) => {
      expect(styleOf(screen.getByText('Optional')).color).toBe(palette.slate)
    })
  })

  it('associates the label without an id, and announces the error as text', () => {
    // RN has no aria-invalid and accessibilityLabelledBy is Android-only, so
    // the label rides on the control and the error goes into the hint.
    inScheme('light', <TextInput testID="field" label="Email" error="Required" />)
    const input = screen.getByTestId('field')
    expect(input.getAttribute('aria-label')).toBe('Email')
    expect(input.getAttribute('data-hint')).toContain('Required')
  })

  it('keeps a caller-supplied hint alongside the error', () => {
    inScheme(
      'light',
      <TextInput testID="field" label="Email" accessibilityHint="Work address" error="Required" />,
    )
    const hint = screen.getByTestId('field').getAttribute('data-hint')
    expect(hint).toBe('Work address. Required')
  })
})

describe('buttons', () => {
  const btn = () => screen.getByTestId('btn')
  const label = () => styleOf(btn().querySelector('span')!)

  it('fills each variant from the right token, in both schemes', () => {
    bothSchemes(<PrimaryButton testID="btn" label="Go" />, (p) =>
      expect(style('btn').backgroundColor).toBe(p.coral[500]),
    )
    bothSchemes(<RewardButton testID="btn" label="Go" />, (p) =>
      expect(style('btn').backgroundColor).toBe(p.sun[500]),
    )
    bothSchemes(<DangerButton testID="btn" label="Delete" />, (p) =>
      expect(style('btn').backgroundColor).toBe(p.error),
    )
    bothSchemes(<SecondaryButton testID="btn" label="More" />, (p) => {
      // surface-raised, not transparent — see Button.tsx:30.
      expect(style('btn').backgroundColor).toBe(p.surfaceRaised)
      expect(style('btn').borderColor).toBe(p.teal[500])
      expect(style('btn').borderWidth).toBe(2)
    })
    bothSchemes(<OutlineButton testID="btn" label="Log out" />, (p) => {
      expect(style('btn').backgroundColor).toBe('transparent')
      // border-input, not the slate the old SecondaryButton used.
      expect(style('btn').borderColor).toBe(p.borderInput)
      expect(style('btn').borderWidth).toBe(1)
    })
    bothSchemes(<GhostButton testID="btn" label="Cancel" />, () =>
      expect(style('btn').backgroundColor).toBe('transparent'),
    )
  })

  it('labels the saturated fills in literal white and the rest from the theme', () => {
    bothSchemes(<PrimaryButton testID="btn" label="Go" />, () =>
      expect(label().color).toBe('#FFFFFF'),
    )
    bothSchemes(<DangerButton testID="btn" label="Delete" />, () =>
      expect(label().color).toBe('#FFFFFF'),
    )
    // Sun is a light fill, so its label is themed and must flip.
    bothSchemes(<RewardButton testID="btn" label="Go" />, (p) => expect(label().color).toBe(p.ink))
    bothSchemes(<GhostButton testID="btn" label="Cancel" />, (p) =>
      expect(label().color).toBe(p.slate),
    )
    bothSchemes(<SecondaryButton testID="btn" label="More" />, (p) =>
      expect(label().color).toBe(p.teal[500]),
    )
  })

  it('takes its geometry from the web size scale', () => {
    // sm uses rounded-md, not rounded-sm — the size and radius scales are
    // offset by one (Button.tsx:37). Native's old 16x12 matched no web size.
    const geometry = { sm: [12, 16, 8, 13], md: [16, 26, 14, 16], lg: [20, 34, 18, 18] } as const
    for (const [size, [radius, px, py, fontSize]] of Object.entries(geometry)) {
      const { unmount } = inScheme(
        'light',
        <PrimaryButton testID="btn" label="Go" size={size as 'sm' | 'md' | 'lg'} />,
      )
      expect(style('btn').borderRadius).toBe(radius)
      expect(style('btn').paddingHorizontal).toBe(px)
      expect(style('btn').paddingVertical).toBe(py)
      expect(label().fontSize).toBe(fontSize)
      unmount()
    }
  })

  it('renders labels in the display face, weight carried by the family', () => {
    inScheme('light', <PrimaryButton testID="btn" label="Go" />)
    expect(label().fontFamily).toBe(fontFamily.display)
    expect(label().fontWeight).toBeUndefined()
  })

  it('lifts and sinks only the variants that do so on web', () => {
    // primary/reward lift and sink 3px; danger sinks 1px with no shadow;
    // secondary/ghost/outline neither. Read off Button.tsx:27-33.
    bothSchemes(<PrimaryButton testID="btn" label="Go" />, (_p, scheme) => {
      expect(style('btn').boxShadow).toEqual([getShadows(scheme).buttonLiftCoral])
      fireEvent.mouseDown(btn())
      expect(style('btn').boxShadow).toEqual([getShadows(scheme).buttonPressedCoral])
      expect(style('btn').transform).toEqual([{ translateY: 3 }])
      fireEvent.mouseUp(btn())
      expect(style('btn').boxShadow).toEqual([getShadows(scheme).buttonLiftCoral])
      expect(style('btn').transform).toBeUndefined()
    })

    bothSchemes(<RewardButton testID="btn" label="Go" />, (_p, scheme) => {
      expect(style('btn').boxShadow).toEqual([getShadows(scheme).buttonLiftSun])
      fireEvent.mouseDown(btn())
      expect(style('btn').boxShadow).toEqual([getShadows(scheme).buttonPressedSun])
    })

    const danger = inScheme('light', <DangerButton testID="btn" label="Delete" />)
    expect(style('btn').boxShadow).toBeUndefined()
    fireEvent.mouseDown(btn())
    expect(style('btn').transform).toEqual([{ translateY: 1 }])
    danger.unmount()

    for (const flat of [
      <SecondaryButton key="s" testID="btn" label="More" />,
      <GhostButton key="g" testID="btn" label="Cancel" />,
      <OutlineButton key="o" testID="btn" label="Log out" />,
    ]) {
      const { unmount } = inScheme('light', flat)
      fireEvent.mouseDown(btn())
      expect(style('btn').transform).toBeUndefined()
      expect(style('btn').boxShadow).toBeUndefined()
      unmount()
    }
  })

  it('swaps the whole visual when disabled, rather than dimming it', () => {
    // #5 moved web off opacity onto these tokens; native buttons kept
    // opacity: 0.6, which reads differently over light and dark surfaces.
    bothSchemes(<PrimaryButton testID="btn" label="Go" disabled />, (p) => {
      expect(style('btn').backgroundColor).toBe(p.disabledBg)
      expect(label().color).toBe(p.disabledText)
      expect(style('btn').opacity).toBeUndefined()
      expect(style('btn').boxShadow).toBeUndefined()
    })
    // A disabled outline button becomes a solid grey box, as on web: disabled
    // substitutes the variant rather than layering over it.
    bothSchemes(<OutlineButton testID="btn" label="Log out" disabled />, (p) => {
      expect(style('btn').backgroundColor).toBe(p.disabledBg)
      expect(style('btn').borderWidth).toBeUndefined()
    })
  })

  it('reports its disabled state to accessibility', () => {
    inScheme('light', <PrimaryButton testID="btn" label="Go" disabled />)
    expect(btn().getAttribute('aria-disabled')).toBe('true')
  })

  it('moves to the hover tokens for pointer devices', () => {
    bothSchemes(<PrimaryButton testID="btn" label="Go" />, (p) => {
      fireEvent.mouseEnter(btn())
      expect(style('btn').backgroundColor).toBe(p.coralHover)
      fireEvent.mouseLeave(btn())
      expect(style('btn').backgroundColor).toBe(p.coral[500])
    })
    // Ghost is the only variant whose label colour also moves.
    bothSchemes(<GhostButton testID="btn" label="Cancel" />, (p) => {
      fireEvent.mouseEnter(btn())
      expect(style('btn').backgroundColor).toBe(p.border)
      expect(label().color).toBe(p.ink)
    })
  })

  it('stretches only when asked', () => {
    const narrow = inScheme('light', <PrimaryButton testID="btn" label="Go" />)
    expect(style('btn').alignSelf).toBe('flex-start')
    expect(style('btn').width).toBeUndefined()
    narrow.unmount()

    inScheme('light', <PrimaryButton testID="btn" label="Go" fullWidth />)
    expect(style('btn').width).toBe('100%')
    expect(style('btn').alignSelf).toBe('stretch')
  })
})

describe('Modal', () => {
  const modal = (
    <Modal
      isOpen
      title="Delete?"
      onClose={() => {}}
      onConfirm={() => {}}
      confirmText="Delete"
      variant="error"
    />
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

  it('renders the error confirm as a DangerButton rather than an inline fill', () => {
    bothSchemes(modal, (palette) => {
      const confirm = screen.getByText('Delete').closest('button')!
      expect(styleOf(confirm).backgroundColor).toBe(palette.error)
      // The inline version dimmed with opacity; DangerButton does not.
      expect(styleOf(confirm).opacity).toBeUndefined()
    })
  })

  it('renders cancel as a ghost button, matching web', () => {
    // Native used the slate-outlined SecondaryButton here while web used ghost,
    // so the two Modals disagreed on the cancel button's visual identity.
    bothSchemes(
      <Modal
        isOpen
        title="Delete?"
        onClose={() => {}}
        onConfirm={() => {}}
        confirmText="Delete"
        onCancel={() => {}}
        cancelText="Keep"
      />,
      (palette) => {
        const cancel = screen.getByText('Keep').closest('button')!
        expect(styleOf(cancel).backgroundColor).toBe('transparent')
        expect(styleOf(cancel).borderWidth).toBeUndefined()
        expect(styleOf(screen.getByText('Keep')).color).toBe(palette.slate)
      },
    )
  })

  it('shows the caller-supplied confirmation prompt, with no built-in fallback', () => {
    inScheme(
      'light',
      <Modal
        isOpen
        title="Delete?"
        onClose={() => {}}
        onConfirm={() => {}}
        confirmText="Delete"
        confirmationValue="unit-1"
        confirmationLabel="Type the unit name to confirm"
      />,
    )
    expect(screen.getByText('Type the unit name to confirm')).toBeTruthy()
    // The English fallback that used to live here is gone, as is web's Spanish one.
    expect(screen.queryByText(/To confirm, write/)).toBeNull()
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
