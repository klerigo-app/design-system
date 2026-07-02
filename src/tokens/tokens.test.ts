import { describe, it, expect } from 'vitest'
import { colors, radii, shadows } from './tokens'

describe('tokens', () => {
  it('exposes all three brand color ramps with the 6 README steps', () => {
    for (const ramp of [colors.coral, colors.sun, colors.teal]) {
      expect(Object.keys(ramp)).toEqual(['50', '100', '300', '500', '700', '900'])
    }
  })

  it('matches the README hex values for the 500 steps', () => {
    expect(colors.coral[500]).toBe('#F14E3A')
    expect(colors.sun[500]).toBe('#FFC23C')
    expect(colors.teal[500]).toBe('#17A2A2')
  })

  it('matches the README neutral and semantic hex values', () => {
    expect(colors.paper).toBe('#FFFDF7')
    expect(colors.ink).toBe('#1F2933')
    expect(colors.error).toBe('#E23B3B')
  })

  it('exposes the button lift shadows and pill radius', () => {
    expect(shadows.buttonLiftCoral).toBe('0 4px 0 #C63823')
    expect(shadows.buttonLiftSun).toBe('0 4px 0 #D99A18')
    expect(radii.pill).toBe('9999px')
  })
})
