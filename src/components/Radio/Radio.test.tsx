import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio } from './Radio'

describe('Radio', () => {
  it('associates the label with the radio input', () => {
    render(<Radio id="online" name="mode" label="En línea" />)
    expect(screen.getByLabelText('En línea')).toBeInTheDocument()
  })

  it('renders as an actual radio input', () => {
    render(<Radio id="online" name="mode" label="En línea" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('only allows one radio in a group to be checked', async () => {
    render(
      <>
        <Radio id="online" name="mode" label="En línea" />
        <Radio id="inperson" name="mode" label="Presencial" />
      </>,
    )
    await userEvent.click(screen.getByLabelText('En línea'))
    expect(screen.getByLabelText('En línea')).toBeChecked()
    await userEvent.click(screen.getByLabelText('Presencial'))
    expect(screen.getByLabelText('Presencial')).toBeChecked()
    expect(screen.getByLabelText('En línea')).not.toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Radio id="online" name="mode" label="En línea" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
