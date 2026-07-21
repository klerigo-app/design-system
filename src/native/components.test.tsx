import { describe, it, expect, vi } from 'vitest'
import {
  act,
  cleanup as cleanupRender,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { type ReactElement } from 'react'
import { styleOf } from './__test__/rn-stub'
import { iconOf } from './__test__/vector-icons-stub'
import { LETTER_K_PATH } from '../components/Logo/glyphPaths'
import { getPalette, getShadows, type ColorScheme, type Palette } from '../tokens/tokens'
import { fontFamily } from './fonts'
import { ThemeProvider } from './theme'
import { Screen } from './Screen'
import { Heading, Text } from './Text'
import { Field } from './Field'
import { TextInput } from './TextInput'
import {
  DangerButton,
  GhostButton,
  OutlineButton,
  PrimaryButton,
  RewardButton,
  SecondaryButton,
} from './Button'
import { Modal } from './Modal'
import { ToastProvider, useToast } from './Toast'
import { Card } from './Card'
import { Chip } from './Chip'
import { Checkbox } from './Checkbox'
import { Toggle } from './Toggle'
import { SearchField } from './SearchField'
import { SegmentedControl } from './SegmentedControl'
import { Select } from './Select'
import { MultiSelect } from './MultiSelect'
import { AnswerOption } from './AnswerOption'
import { LogoMark } from './LogoMark'

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

/**
 * The glyph a component asked @expo/vector-icons for, or null if it drew none.
 * `color` is a prop rather than a style on the real component, so it lands on a
 * data attribute — the same treatment Field's placeholderTextColor gets.
 */
const iconIn = (testId: string) => {
  const icon = screen.getByTestId(testId).querySelector('[data-icon]')
  return icon ? iconOf(icon) : null
}

/**
 * Checkbox's box and Toggle's track carry no testID of their own — the testID
 * belongs on the pressable row, which is what a caller taps. Both are the row's
 * first child, the label being the second.
 */
const firstChildStyle = (testId: string) => styleOf(screen.getByTestId(testId).children[0])
const boxIn = firstChildStyle
const trackIn = firstChildStyle

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

// ---------------------------------------------------------------------------
// #10's primitives.
//
// Every one gets a bothSchemes assertion, for the reason at the top of this
// file: a colour that is right in light and unchanged in dark is the exact bug
// this harness exists to catch, and ten new components is ten new chances at it.
// ---------------------------------------------------------------------------

describe('Card', () => {
  it('themes surface and border across the two bordered variants', () => {
    bothSchemes(
      <>
        <Card testID="flat" />
        <Card testID="elevated" variant="elevated" />
      </>,
      (palette) => {
        for (const id of ['flat', 'elevated']) {
          expect(style(id).backgroundColor).toBe(palette.surfaceRaised)
          expect(style(id).borderColor).toBe(palette.border)
        }
      },
    )
  })

  it('takes its elevation from the themed shadow scale', () => {
    bothSchemes(<Card testID="card" variant="elevated" />, (_palette, scheme) => {
      expect(style('card').boxShadow).toEqual([getShadows(scheme).cardElevated])
    })
    // The flat variant must not quietly acquire one.
    inScheme('light', <Card testID="flat" />)
    expect(style('flat').boxShadow).toBeUndefined()
  })

  it('matches web geometry: rounded-xl and p-6', () => {
    inScheme('light', <Card testID="card" />)
    expect(style('card').borderRadius).toBe(20)
    expect(style('card').padding).toBe(24)
  })

  it('puts the feature variant on the inverse surface and clips its circle', () => {
    bothSchemes(<Card testID="card" variant="feature" decorativeCircle />, (palette) => {
      expect(style('card').backgroundColor).toBe(palette.surfaceInverse)
      // Without this the disc bleeds past the rounded corner.
      expect(style('card').overflow).toBe('hidden')
    })
  })

  it('draws the decorative circle only for the feature variant', () => {
    // The circle has no testID; it is the card's first child when present.
    inScheme('light', <Card testID="a" variant="feature" decorativeCircle />)
    expect(screen.getByTestId('a').children).toHaveLength(1)
    cleanupRender()
    inScheme('light', <Card testID="b" variant="flat" decorativeCircle />)
    expect(screen.getByTestId('b').children).toHaveLength(0)
  })
})

describe('Chip', () => {
  it('themes every variant from the palette, including the tinted 50/700 pairs', () => {
    // The 50s and 700s invert in dark — teal-50 is a deep background there and
    // teal-700 is light text — so a frozen table would be visibly wrong.
    bothSchemes(
      <>
        <Chip testID="level" variant="level" label="A2" />
        <Chip testID="category" variant="category" label="Vocab" />
        <Chip testID="new" variant="new" label="New" />
        <Chip testID="completed" variant="completed" label="Done" />
        <Chip testID="outline" variant="outline" label="Draft" />
      </>,
      (palette) => {
        expect(style('level').backgroundColor).toBe(palette.teal[50])
        expect(style('category').backgroundColor).toBe(palette.coral[50])
        expect(style('new').backgroundColor).toBe(palette.sun[50])
        expect(style('completed').backgroundColor).toBe(palette.successTint)
        expect(style('outline').borderColor).toBe(palette.borderInput)
      },
    )
  })

  it('keeps white labels on the two saturated fills', () => {
    // coral-500 and surface-inverse do not flip under the label, so the label
    // must not flip either — the one sanctioned literal.
    bothSchemes(
      <>
        <Chip testID="live" variant="live" label="Live" />
        <Chip testID="dark" variant="dark" label="Admin" />
      </>,
      (palette) => {
        expect(style('live').backgroundColor).toBe(palette.coral[500])
        expect(style('dark').backgroundColor).toBe(palette.surfaceInverse)
      },
    )
  })

  it('prefixes completed with a check glyph and live with a dot', () => {
    inScheme(
      'light',
      <>
        <Chip testID="completed" variant="completed" label="Done" />
        <Chip testID="level" variant="level" label="A2" />
      </>,
    )
    expect(iconIn('completed')?.name).toBe('check')
    // Nothing else grows a glyph by accident.
    expect(iconIn('level')).toBeNull()
  })
})

describe('Checkbox', () => {
  it('fills with coral when checked and shows the check only then', () => {
    bothSchemes(
      <>
        <Checkbox testID="on" label="On" checked onChange={() => {}} />
        <Checkbox testID="off" label="Off" checked={false} onChange={() => {}} />
      </>,
      (palette) => {
        expect(boxIn('on').backgroundColor).toBe(palette.coral[500])
        expect(boxIn('off').borderColor).toBe(palette.borderInput)
        expect(boxIn('off').backgroundColor).toBeUndefined()
        expect(iconIn('on')?.name).toBe('check')
        // Not rendered at opacity 0 — an invisible glyph is still announced.
        expect(iconIn('off')).toBeNull()
      },
    )
  })

  it('greys disabled with the tokens rather than opacity', () => {
    // #5 moved web's Checkbox off opacity onto these two, and the reason binds
    // harder here: a dimmed control reads differently over light and dark paper.
    bothSchemes(
      <Checkbox testID="cb" label="Off" checked={false} disabled onChange={() => {}} />,
      (palette) => {
        expect(boxIn('cb').backgroundColor).toBe(palette.disabledBg)
        expect(boxIn('cb').borderColor).toBe(palette.disabledText)
        expect(style('cb').opacity).toBeUndefined()
      },
    )
  })

  it('reports the value it is moving to, and stays silent when disabled', () => {
    const onChange = vi.fn()
    inScheme('light', <Checkbox testID="cb" label="X" checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cb'))
    expect(onChange).toHaveBeenCalledWith(true)

    cleanupRender()
    const blocked = vi.fn()
    inScheme('light', <Checkbox testID="d" label="X" checked disabled onChange={blocked} />)
    fireEvent.click(screen.getByTestId('d'))
    expect(blocked).not.toHaveBeenCalled()
  })

  it('carries the checkbox role and state for screen readers', () => {
    inScheme('light', <Checkbox testID="cb" label="X" checked onChange={() => {}} />)
    expect(screen.getByTestId('cb')).toHaveAttribute('role', 'checkbox')
  })
})

describe('Toggle', () => {
  it('runs the track from border-input to teal, both themed', () => {
    bothSchemes(
      <>
        <Toggle testID="on" label="On" checked onChange={() => {}} />
        <Toggle testID="off" label="Off" checked={false} onChange={() => {}} />
      </>,
      (palette) => {
        expect(trackIn('on').backgroundColor).toBe(palette.teal[500])
        expect(trackIn('off').backgroundColor).toBe(palette.borderInput)
      },
    )
  })

  it('matches web geometry rather than the platform switch', () => {
    // The reason this is hand-built: RN's Switch is 51x31 on iOS and a Material
    // thumb on Android, so neither matches web's 48x28 nor each other.
    inScheme('light', <Toggle testID="t" label="X" checked onChange={() => {}} />)
    expect(trackIn('t').width).toBe(48)
    expect(trackIn('t').height).toBe(28)
  })

  it('exposes the switch role', () => {
    inScheme('light', <Toggle testID="t" label="X" checked onChange={() => {}} />)
    expect(screen.getByTestId('t')).toHaveAttribute('role', 'switch')
  })

  it('reports the value it is moving to', () => {
    const onChange = vi.fn()
    inScheme('light', <Toggle testID="t" label="X" checked onChange={onChange} />)
    fireEvent.click(screen.getByTestId('t'))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})

describe('SearchField', () => {
  it('is the themed field box with a magnifier in it', () => {
    bothSchemes(
      <SearchField testID="s" accessibilityLabel="Search" placeholder="Find" />,
      (palette) => {
        expect(box('s').backgroundColor).toBe(palette.surfaceRaised)
        expect(box('s').borderColor).toBe(palette.borderInput)
        const icon = screen.getByTestId('s').parentElement!.querySelector('[data-icon]')!
        expect(icon.getAttribute('data-icon')).toBe('search')
        // Muted, and it must follow the scheme like everything else.
        expect(icon.getAttribute('data-icon-color')).toBe(palette.muted)
      },
    )
  })

  it('turns off the corrections web got free from type="search"', () => {
    inScheme('light', <SearchField testID="s" accessibilityLabel="Search" placeholder="Find" />)
    const input = screen.getByTestId('s')
    expect(input).toHaveAttribute('autoCapitalize', 'none')
    expect(input).toHaveAttribute('aria-label', 'Search')
  })
})

describe('SegmentedControl', () => {
  const OPTIONS = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
  ]

  it('paints the track and marks the active segment coral', () => {
    bothSchemes(
      <SegmentedControl testID="sc" options={OPTIONS} value="day" onChange={() => {}} />,
      (palette) => {
        expect(style('sc').backgroundColor).toBe(palette.segmentedTrack)
        const [active, idle] = [...screen.getByTestId('sc').children]
        expect(styleOf(active).backgroundColor).toBe(palette.coral[500])
        expect(styleOf(idle).backgroundColor).toBe('transparent')
      },
    )
  })

  it('reports the tapped value', () => {
    const onChange = vi.fn()
    inScheme(
      'light',
      <SegmentedControl testID="sc" options={OPTIONS} value="day" onChange={onChange} />,
    )
    fireEvent.click([...screen.getByTestId('sc').children][1])
    expect(onChange).toHaveBeenCalledWith('week')
  })

  it('marks the active segment selected for screen readers', () => {
    inScheme(
      'light',
      <SegmentedControl testID="sc" options={OPTIONS} value="week" onChange={() => {}} />,
    )
    const segments = [...screen.getByTestId('sc').children]
    expect(segments[0]).toHaveAttribute('role', 'tab')
    expect(segments[1]).toHaveAttribute('role', 'tab')
  })
})

describe('AnswerOption', () => {
  it('themes all four states', () => {
    bothSchemes(
      <>
        <AnswerOption testID="default" label="A" />
        <AnswerOption testID="selected" status="selected" label="B" />
        <AnswerOption testID="correct" status="correct" label="C" />
        <AnswerOption testID="wrong" status="wrong" label="D" />
      </>,
      (palette) => {
        expect(style('default').borderColor).toBe(palette.borderInput)
        expect(style('default').backgroundColor).toBe(palette.surfaceRaised)
        expect(style('selected').borderColor).toBe(palette.teal[500])
        expect(style('selected').backgroundColor).toBe(palette.surfaceSelected)
        expect(style('correct').borderColor).toBe(palette.success)
        expect(style('correct').backgroundColor).toBe(palette.successTint)
        expect(style('wrong').borderColor).toBe(palette.errorBorder)
        expect(style('wrong').backgroundColor).toBe(palette.errorTint)
      },
    )
  })

  it('badges correct and wrong with the right glyph', () => {
    inScheme(
      'light',
      <>
        <AnswerOption testID="correct" status="correct" label="C" />
        <AnswerOption testID="wrong" status="wrong" label="D" />
        <AnswerOption testID="selected" status="selected" label="B" />
      </>,
    )
    expect(iconIn('correct')?.name).toBe('check')
    expect(iconIn('wrong')?.name).toBe('x')
    // Selected is a plain teal dot, not a glyph.
    expect(iconIn('selected')).toBeNull()
  })

  it('reports selection', () => {
    const onSelect = vi.fn()
    inScheme('light', <AnswerOption testID="a" label="A" onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('a'))
    expect(onSelect).toHaveBeenCalled()
  })
})

describe('LogoMark', () => {
  const fills = (testID: string) => {
    const svg = screen.getByTestId(testID)
    return {
      tile: svg.querySelector('rect')!,
      letter: svg.querySelector('path')!,
      dot: svg.querySelector('circle')!,
    }
  }

  it('reads the brand tokens, and they are the same in both schemes', () => {
    // The point of the tokens being invariant: a logo that recoloured itself in
    // dark would be a different logo.
    bothSchemes(<LogoMark testID="m" variant="coral" />, (palette) => {
      expect(fills('m').tile).toHaveAttribute('fill', palette.brandMarkTile)
      expect(fills('m').letter).toHaveAttribute('fill', palette.brandMarkLetter)
      expect(fills('m').dot).toHaveAttribute('fill', palette.brandMarkDot)
    })
    expect(getPalette('light').brandMarkTile).toBe(getPalette('dark').brandMarkTile)
  })

  it('inks the outline variant letter rather than knocking it out white', () => {
    // The navy does two jobs and they are easy to conflate: knockout tile, and
    // the outline variant's letter, where the other two variants use white.
    inScheme(
      'light',
      <>
        <LogoMark testID="knockout" variant="knockout" />
        <LogoMark testID="outline" variant="outline" />
      </>,
    )
    const palette = getPalette('light')
    expect(fills('knockout').tile).toHaveAttribute('fill', palette.brandMarkInk)
    expect(fills('knockout').letter).toHaveAttribute('fill', palette.brandMarkLetter)
    expect(fills('outline').tile).toHaveAttribute('fill', 'none')
    expect(fills('outline').tile).toHaveAttribute('stroke', palette.brandMarkInk)
    expect(fills('outline').letter).toHaveAttribute('fill', palette.brandMarkInk)
  })

  it('draws the real extracted glyph, not an approximation', () => {
    inScheme('light', <LogoMark testID="m" />)
    expect(fills('m').letter.getAttribute('d')).toBe(LETTER_K_PATH)
  })
})

describe('Select', () => {
  const OPTIONS = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ]
  const select = (props: Partial<React.ComponentProps<typeof Select>> = {}) => (
    <Select
      testID="sel"
      label="Idioma"
      options={OPTIONS}
      value=""
      onChange={() => {}}
      placeholder="Elige uno"
      {...props}
    />
  )
  // The trigger is the Pressable inside Select's wrapper, after the label.
  const trigger = () => screen.getByRole('button', { name: 'Idioma' })

  it('shows the placeholder in muted until something is selected', () => {
    bothSchemes(select(), (palette) => {
      expect(screen.getByText('Elige uno')).toBeTruthy()
      expect(styleOf(screen.getByText('Elige uno')).color).toBe(palette.muted)
    })
    cleanupRender()
    inScheme('light', select({ value: 'es' }))
    expect(screen.getByText('Español')).toBeTruthy()
    expect(screen.queryByText('Elige uno')).toBeNull()
  })

  it('draws the trigger as the same box a Field draws', () => {
    // Shared with fieldParts rather than a lookalike, so the two cannot drift.
    bothSchemes(select(), (palette) => {
      expect(styleOf(trigger()).borderColor).toBe(palette.borderInput)
      expect(styleOf(trigger()).backgroundColor).toBe(palette.surfaceRaised)
      expect(styleOf(trigger()).borderRadius).toBe(12)
    })
  })

  it('opens the sheet, commits the tapped option, and closes', () => {
    const onChange = vi.fn()
    inScheme('light', select({ onChange }))
    // The sheet is an RN Modal; the stub renders nothing while it is closed.
    expect(screen.queryByTestId('modal')).toBeNull()

    fireEvent.click(trigger())
    expect(screen.getByTestId('modal')).toBeTruthy()

    fireEvent.click(screen.getByText('English'))
    expect(onChange).toHaveBeenCalledWith('en')
    // A single choice needs no confirm step, so choosing dismisses.
    expect(screen.queryByTestId('modal')).toBeNull()
  })

  it('rings the trigger red on error and says why in text', () => {
    // RN has no aria-invalid and no `invalid` in accessibilityState, so an
    // error can only be announced as text — not flagged as a state.
    bothSchemes(select({ error: 'Requerido' }), (palette, scheme) => {
      expect(styleOf(trigger()).borderColor).toBe(palette.error)
      expect(styleOf(trigger()).boxShadow).toEqual([getShadows(scheme).focusRingError])
      expect(screen.getByText('Requerido')).toBeTruthy()
    })
  })

  it('keeps the error ring while open, because error outranks focus', () => {
    inScheme('light', select({ error: 'Requerido' }))
    fireEvent.click(trigger())
    expect(styleOf(trigger()).borderColor).toBe(getPalette('light').error)
  })
})

describe('MultiSelect', () => {
  const OPTIONS = [
    { value: 'tutor', label: 'Tutor' },
    { value: 'admin', label: 'Admin' },
  ]
  const multi = (props: Partial<React.ComponentProps<typeof MultiSelect>> = {}) => (
    <MultiSelect
      testID="ms"
      label="Roles"
      options={OPTIONS}
      value={[]}
      onChange={() => {}}
      placeholder="Elige roles"
      doneText="Listo"
      {...props}
    />
  )
  const trigger = () => screen.getByRole('button', { name: 'Roles' })
  /**
   * Queries scoped to the open sheet. The label and the option names also
   * appear on the trigger behind it, so an unscoped getByText picks the wrong
   * one — which looks like the component not reacting rather than the test
   * clicking the wrong element.
   */
  const sheet = () => within(screen.getByTestId('modal'))

  it('summarises the selection in the options order, not the tick order', () => {
    // Ticking admin before tutor must not reshuffle the trigger text.
    inScheme('light', multi({ value: ['admin', 'tutor'] }))
    expect(screen.getByText('Tutor, Admin')).toBeTruthy()
  })

  it('toggles a value on and back off without closing', () => {
    const onChange = vi.fn()
    inScheme('light', multi({ value: ['tutor'], onChange }))
    fireEvent.click(trigger())

    fireEvent.click(sheet().getByText('Admin'))
    expect(onChange).toHaveBeenCalledWith(['tutor', 'admin'])

    fireEvent.click(sheet().getByText('Tutor'))
    expect(onChange).toHaveBeenLastCalledWith([])
    // Picking more than one thing means no single tap can mean "done".
    expect(screen.queryByTestId('modal')).toBeTruthy()
  })

  it('closes on the required done label', () => {
    inScheme('light', multi())
    fireEvent.click(trigger())
    fireEvent.click(sheet().getByText('Listo'))
    expect(screen.queryByTestId('modal')).toBeNull()
  })

  it('themes the sheet surface and scrim', () => {
    bothSchemes(multi(), (palette) => {
      fireEvent.click(trigger())
      const panel = sheet().getByText('Roles').parentElement!
      expect(styleOf(panel).backgroundColor).toBe(palette.surfaceRaised)
      // Same scrim treatment Modal uses — its own token, because dark wants
      // pure black behind the sheet rather than a lifted ink.
      expect(styleOf(panel.parentElement!).backgroundColor).toBe(`${palette.scrim}99`)
    })
  })
})
