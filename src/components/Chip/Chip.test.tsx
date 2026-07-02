import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from './Chip'

describe('Chip', () => {
  it.each(['level', 'category', 'new', 'completed', 'live', 'dark', 'outline'] as const)(
    'renders the %s variant with its text',
    (variant) => {
      render(<Chip variant={variant}>Etiqueta</Chip>)
      expect(screen.getByText('Etiqueta')).toBeInTheDocument()
    },
  )

  it('renders a leading check mark only for the completed variant', () => {
    const { container: completed } = render(<Chip variant="completed">Completado</Chip>)
    const { container: level } = render(<Chip variant="level">A2</Chip>)
    expect(completed.querySelectorAll('svg')).toHaveLength(1)
    expect(level.querySelectorAll('svg')).toHaveLength(0)
  })

  it('renders a leading dot only for the live variant', () => {
    render(<Chip variant="live">En vivo</Chip>)
    expect(screen.getByText('En vivo').parentElement?.querySelector('[aria-hidden]')).toBeInTheDocument()
  })
})
