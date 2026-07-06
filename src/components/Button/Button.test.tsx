import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it.each(['primary', 'reward', 'secondary', 'ghost', 'danger'] as const)(
    'renders the %s variant',
    (variant) => {
      render(<Button variant={variant}>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    },
  )

  it.each(['sm', 'md', 'lg'] as const)('renders the %s size', (size) => {
    render(<Button size={size}>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('fires onClick when enabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a leading icon when provided', () => {
    render(<Button icon={<svg data-testid="icon" />}>Click me</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders an anchor with as="a"', () => {
    render(
      <Button as="a" href="#contacto" size="lg">
        Empieza ahora
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Empieza ahora' })
    expect(link).toHaveAttribute('href', '#contacto')
    expect(link).toHaveClass('bg-coral-500')
  })

  it('lets className override conflicting variant classes', () => {
    render(<Button className="bg-teal-500">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-teal-500')
    expect(button).not.toHaveClass('bg-coral-500')
  })
})
