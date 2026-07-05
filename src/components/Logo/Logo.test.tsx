import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LogoMark } from './LogoMark'
import { Logo } from './Logo'

describe('LogoMark', () => {
  it('renders with an accessible label', () => {
    render(<LogoMark />)
    expect(screen.getByRole('img', { name: 'EspañoLenka' })).toBeInTheDocument()
  })

  it.each(['coral', 'knockout', 'outline'] as const)(
    'renders the %s variant without throwing',
    (variant) => {
      render(<LogoMark variant={variant} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    },
  )
})

describe('Logo', () => {
  it('renders both parts of the wordmark', () => {
    render(<Logo />)
    expect(screen.getByText('Españo')).toBeInTheDocument()
    expect(screen.getByText('Lenka')).toBeInTheDocument()
  })

  it.each(['horizontal', 'stacked'] as const)(
    'renders the %s orientation without throwing',
    (orientation) => {
      render(<Logo orientation={orientation} />)
      expect(screen.getByText('Españo')).toBeInTheDocument()
    },
  )
})
