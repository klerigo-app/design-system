import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('exposes progressbar semantics with the current value', () => {
    render(<ProgressBar value={6} max={10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '6')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('defaults max to 100', () => {
    render(<ProgressBar value={40} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps the fill width to 100% when value exceeds max', () => {
    render(<ProgressBar value={15} max={10} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('100%')
  })

  it('clamps the fill width to 0% when value is negative', () => {
    render(<ProgressBar value={-5} max={10} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('0%')
  })
})
