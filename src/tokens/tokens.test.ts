import { describe, it, expect } from 'vitest'
import { getPalette, radii, shadows } from './tokens'

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

  it('exposes the button lift shadows and pill radius', () => {
    expect(shadows.buttonLiftCoral).toBe('0 4px 0 #C63823')
    expect(shadows.buttonLiftSun).toBe('0 4px 0 #D99A18')
    expect(radii.pill).toBe('9999px')
  })

  it('flips surfaces and text between the two schemes', () => {
    const dark = getPalette('dark')
    expect(dark.paper).toBe('#181310')
    expect(dark.ink).toBe('#F4EFE7')
    // The brand 500s stay vivid — see THEME_INVARIANT.
    expect(dark.coral[500]).toBe(light.coral[500])
  })
})
