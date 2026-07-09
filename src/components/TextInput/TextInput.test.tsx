import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('associates the label with the input', () => {
    render(<TextInput id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows helper text when there is no error', () => {
    render(<TextInput id="email" label="Email" helperText="We will not share this" />)
    expect(screen.getByText('We will not share this')).toBeInTheDocument()
  })

  it('shows error text instead of helper text, and marks the input invalid', () => {
    render(<TextInput id="email" label="Email" helperText="hint" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.queryByText('hint')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onChange as the user types', async () => {
    const onChange = vi.fn()
    render(<TextInput id="email" label="Email" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('sizes the input to fill its container', () => {
    render(<TextInput id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toHaveClass('w-full')
  })
})
