import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders an h2 by default', () => {
    render(<Heading>Título</Heading>)
    expect(screen.getByRole('heading', { level: 2, name: 'Título' })).toBeInTheDocument()
  })

  it('renders the element given by `as`', () => {
    render(<Heading as="h1">Portada</Heading>)
    expect(screen.getByRole('heading', { level: 1, name: 'Portada' })).toBeInTheDocument()
  })

  it.each([
    ['sm', 'text-lg'],
    ['md', 'text-xl'],
    ['lg', 'text-2xl'],
    ['xl', 'text-3xl'],
  ] as const)('maps size %s to %s', (size, expected) => {
    render(<Heading size={size}>Tamaño</Heading>)
    expect(screen.getByText('Tamaño')).toHaveClass(expected)
  })

  it('lets className override conflicting classes', () => {
    render(<Heading className="text-white">Claro</Heading>)
    const el = screen.getByText('Claro')
    expect(el).toHaveClass('text-white')
    expect(el).not.toHaveClass('text-ink')
  })
})
