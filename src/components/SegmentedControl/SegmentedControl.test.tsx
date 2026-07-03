import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from './SegmentedControl'

describe('SegmentedControl', () => {
  const options = [
    { value: 'cz', label: 'CZ' },
    { value: 'es', label: 'ES' },
  ]

  it('renders all option labels', () => {
    render(<SegmentedControl options={options} value="cz" onChange={vi.fn()} />)
    expect(screen.getByText('CZ')).toBeInTheDocument()
    expect(screen.getByText('ES')).toBeInTheDocument()
  })

  it('marks the active option with aria-selected="true"', () => {
    render(<SegmentedControl options={options} value="cz" onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('tab')
    expect(buttons[0]).toHaveAttribute('aria-selected', 'true')
    expect(buttons[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('marks inactive options with aria-selected="false"', () => {
    render(<SegmentedControl options={options} value="es" onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('tab')
    expect(buttons[0]).toHaveAttribute('aria-selected', 'false')
    expect(buttons[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange with the clicked option value when clicking a non-active option', async () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="cz" onChange={onChange} />)
    const esButton = screen.getByText('ES')
    await userEvent.click(esButton)
    expect(onChange).toHaveBeenCalledWith('es')
  })

  it('calls onChange when clicking the already-active option', async () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="cz" onChange={onChange} />)
    const czButton = screen.getByText('CZ')
    await userEvent.click(czButton)
    expect(onChange).toHaveBeenCalledWith('cz')
  })

  it('works with more than 2 options', () => {
    const threeOptions = [
      { value: 'en', label: 'EN' },
      { value: 'cz', label: 'CZ' },
      { value: 'es', label: 'ES' },
    ]
    render(<SegmentedControl options={threeOptions} value="cz" onChange={vi.fn()} />)
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('CZ')).toBeInTheDocument()
    expect(screen.getByText('ES')).toBeInTheDocument()
  })
})
