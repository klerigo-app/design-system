import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LogoMark } from './LogoMark'
import { Logo } from './Logo'

describe('LogoMark', () => {
  it('renders with an accessible label', () => {
    render(<LogoMark />)
    expect(screen.getByRole('img', { name: 'Klerigo' })).toBeInTheDocument()
  })

  it.each(['coral', 'knockout', 'outline'] as const)(
    'renders the %s variant without throwing',
    (variant) => {
      render(<LogoMark variant={variant} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    },
  )

  /**
   * These assert the token wiring, which nothing above covered: every variant
   * rendered "without throwing" just as happily when the colours were three
   * hardcoded hexes, so a wrong fill was invisible.
   *
   * The navy does two jobs and they are easy to conflate — it is the knockout
   * tile *and* the outline variant's letter, where coral and knockout use
   * white. Each row below pins one of those.
   */
  describe('brand mark colours come from the brand-mark tokens', () => {
    const marks = (variant: 'coral' | 'knockout' | 'outline') => {
      const { container } = render(<LogoMark variant={variant} />)
      return {
        tile: container.querySelector('rect'),
        letter: container.querySelector('path'),
        dot: container.querySelector('circle'),
      }
    }

    it('fills the coral tile and knocks the letter out in white', () => {
      const { tile, letter } = marks('coral')
      expect(tile).toHaveAttribute('fill', 'var(--color-brand-mark-tile)')
      expect(letter).toHaveAttribute('fill', 'var(--color-brand-mark-letter)')
    })

    it('fills the knockout tile with the mark ink, letter still white', () => {
      const { tile, letter } = marks('knockout')
      expect(tile).toHaveAttribute('fill', 'var(--color-brand-mark-ink)')
      expect(letter).toHaveAttribute('fill', 'var(--color-brand-mark-letter)')
    })

    it('strokes the outline variant and inks its letter — not white', () => {
      const { tile, letter } = marks('outline')
      expect(tile).toHaveAttribute('fill', 'none')
      expect(tile).toHaveAttribute('stroke', 'var(--color-brand-mark-ink)')
      expect(letter).toHaveAttribute('fill', 'var(--color-brand-mark-ink)')
    })

    it.each(['coral', 'knockout', 'outline'] as const)('dots the %s variant in sun', (variant) => {
      expect(marks(variant).dot).toHaveAttribute('fill', 'var(--color-brand-mark-dot)')
    })
  })
})

describe('Logo', () => {
  it('renders the wordmark', () => {
    render(<Logo />)
    expect(screen.getByText('Klerigo')).toBeInTheDocument()
  })

  it.each(['horizontal', 'stacked'] as const)(
    'renders the %s orientation without throwing',
    (orientation) => {
      render(<Logo orientation={orientation} />)
      expect(screen.getByText('Klerigo')).toBeInTheDocument()
    },
  )
})
