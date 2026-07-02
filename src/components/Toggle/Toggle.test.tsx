import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('associates the label with the switch', () => {
    render(<Toggle id="notifications" label="Notificaciones" />)
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument()
  })

  it('exposes a switch role', () => {
    render(<Toggle id="notifications" label="Notificaciones" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('fires onChange and toggles on click', async () => {
    const onChange = vi.fn()
    render(<Toggle id="notifications" label="Notificaciones" onChange={onChange} />)
    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(toggle).toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Toggle id="notifications" label="Notificaciones" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
