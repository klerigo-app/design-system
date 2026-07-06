import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it.each(['flat', 'elevated', 'feature'] as const)(
    'renders the %s variant with its children',
    (variant) => {
      render(<Card variant={variant}>Contenido</Card>)
      expect(screen.getByText('Contenido')).toBeInTheDocument()
    },
  )

  it('lifts on hover by default for the elevated variant', () => {
    render(
      <Card variant="elevated" data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').className).toContain('hover:-translate-y-1')
  })

  it('does not lift on hover when interactive is false', () => {
    render(
      <Card variant="elevated" interactive={false} data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').className).not.toContain('hover:-translate-y-1')
  })

  it('does not render a decorative circle by default', () => {
    render(
      <Card variant="feature" data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })

  it('renders a decorative circle only on the feature variant when requested', () => {
    render(
      <Card variant="feature" decorativeCircle data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(1)
  })

  it('ignores decorativeCircle on non-feature variants', () => {
    render(
      <Card variant="flat" decorativeCircle data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })
})
