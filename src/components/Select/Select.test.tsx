import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: 'a2', label: 'A2 · Elemental' },
  { value: 'b1', label: 'B1 · Intermedio' },
]

describe('Select', () => {
  it('associates the label with the select and renders all options', () => {
    render(<Select id="level" label="Nivel" options={options} />)
    const select = screen.getByLabelText('Nivel')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'A2 · Elemental' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'B1 · Intermedio' })).toBeInTheDocument()
  })

  it('shows error text and marks the select invalid', () => {
    render(<Select id="level" label="Nivel" options={options} error="Elige un nivel" />)
    expect(screen.getByText('Elige un nivel')).toBeInTheDocument()
    expect(screen.getByLabelText('Nivel')).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onChange when a new option is selected', async () => {
    const onChange = vi.fn()
    render(<Select id="level" label="Nivel" options={options} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Nivel'), 'b1')
    expect(onChange).toHaveBeenCalled()
  })
})
