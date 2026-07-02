import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('exposes an accessible label with the rounded percent', () => {
    render(<ProgressRing percent={62.4} />)
    expect(screen.getByRole('img', { name: '62% complete' })).toBeInTheDocument()
  })

  it('shows the percent as the inner label by default', () => {
    render(<ProgressRing percent={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows a custom label when provided', () => {
    render(<ProgressRing percent={75} label="Unidad 3" />)
    expect(screen.getByText('Unidad 3')).toBeInTheDocument()
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('shows a caption when provided', () => {
    render(<ProgressRing percent={75} caption="completado" />)
    expect(screen.getByText('completado')).toBeInTheDocument()
  })

  it('clamps percent into the 0-100 range', () => {
    render(<ProgressRing percent={140} />)
    expect(screen.getByRole('img', { name: '100% complete' })).toBeInTheDocument()
  })
})
