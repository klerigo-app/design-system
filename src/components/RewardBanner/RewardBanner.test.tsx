import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RewardBanner } from './RewardBanner'

describe('RewardBanner', () => {
  it('renders the title and subtitle', () => {
    render(<RewardBanner title="¡Lección completada!" subtitle="+50 XP · Nuevo logro" />)
    expect(screen.getByText('¡Lección completada!')).toBeInTheDocument()
    expect(screen.getByText('+50 XP · Nuevo logro')).toBeInTheDocument()
  })

  it('renders a check icon', () => {
    const { container } = render(<RewardBanner title="¡Lección completada!" subtitle="+50 XP" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
