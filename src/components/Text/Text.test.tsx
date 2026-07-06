import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders a p with body styles by default', () => {
    render(<Text>Hola</Text>)
    const el = screen.getByText('Hola')
    expect(el.tagName).toBe('P')
    expect(el).toHaveClass('font-body', 'text-base', 'text-ink')
  })

  it('renders the element given by `as`', () => {
    render(<Text as="span">En línea</Text>)
    expect(screen.getByText('En línea').tagName).toBe('SPAN')
  })

  it('renders the muted variant', () => {
    render(<Text variant="muted">Nota</Text>)
    expect(screen.getByText('Nota')).toHaveClass('text-sm', 'text-slate')
  })

  it('renders the kicker variant', () => {
    render(<Text variant="kicker">Sección</Text>)
    expect(screen.getByText('Sección')).toHaveClass('uppercase', 'text-teal-700')
  })

  it('lets className recolor the kicker', () => {
    render(
      <Text variant="kicker" className="text-sun-500">
        Contacto
      </Text>,
    )
    const el = screen.getByText('Contacto')
    expect(el).toHaveClass('text-sun-500')
    expect(el).not.toHaveClass('text-teal-700')
  })
})
