import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('associates the label with the checkbox', () => {
    render(<Checkbox id="terms" label="Acepto los términos" />)
    expect(screen.getByLabelText('Acepto los términos')).toBeInTheDocument()
  })

  it('renders as an actual checkbox input', () => {
    render(<Checkbox id="terms" label="Acepto los términos" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('fires onChange when clicked and toggles checked state', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="terms" label="Acepto los términos" onChange={onChange} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(checkbox).toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="terms" label="Acepto los términos" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
