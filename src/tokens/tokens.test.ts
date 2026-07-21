import { describe, it, expect } from 'vitest'
import { getPalette, getShadows, radii } from './tokens'

describe('tokens', () => {
  const light = getPalette('light')

  it('exposes all three brand color ramps with the 6 README steps', () => {
    for (const ramp of [light.coral, light.sun, light.teal]) {
      expect(Object.keys(ramp)).toEqual(['50', '100', '300', '500', '700', '900'])
    }
  })

  it('matches the README hex values for the 500 steps', () => {
    expect(light.coral[500]).toBe('#F14E3A')
    expect(light.sun[500]).toBe('#FFC23C')
    expect(light.teal[500]).toBe('#17A2A2')
  })

  it('matches the README neutral and semantic hex values', () => {
    expect(light.paper).toBe('#FFFDF7')
    expect(light.ink).toBe('#1F2933')
    expect(light.error).toBe('#E23B3B')
  })

  it('exposes the button lift shadows structurally, and the pill radius', () => {
    // Hard, zero-blur, coloured offsets — the brand's signature lift. Asserted
    // field by field because that is the whole reason these are objects rather
    // than the CSS strings this export used to hold.
    expect(getShadows('light').buttonLiftCoral).toEqual({
      offsetX: 0,
      offsetY: 4,
      blurRadius: 0,
      spreadDistance: 0,
      color: '#C63823',
    })
    expect(getShadows('light').buttonLiftSun.color).toBe('#D99A18')
    expect(radii.pill).toBe('9999px')
  })

  it('darkens the lift shadows rather than reusing the light ones', () => {
    expect(getShadows('dark').buttonLiftCoral.color).toBe('#7A2E21')
    expect(getShadows('dark').buttonLiftCoral.offsetY).toBe(4)
  })

  it('carries the pressed variants the CSS layer always had', () => {
    // These existed in tokens.css and were missing from tokens.ts entirely;
    // nothing caught it until the parity test grew to cover shadows.
    expect(getShadows('light').buttonPressedCoral.offsetY).toBe(1)
    expect(getShadows('dark').buttonPressedSun.offsetY).toBe(1)
  })

  it('flips surfaces and text between the two schemes', () => {
    const dark = getPalette('dark')
    expect(dark.paper).toBe('#181310')
    expect(dark.ink).toBe('#F4EFE7')
    // The brand 500s stay vivid — see THEME_INVARIANT.
    expect(dark.coral[500]).toBe(light.coral[500])
  })
})
