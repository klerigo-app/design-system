import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOption } from './AnswerOption'

describe('AnswerOption', () => {
  it.each(['default', 'selected', 'correct', 'wrong'] as const)('renders the %s status with its text', (status) => {
    render(<AnswerOption status={status}>fui</AnswerOption>)
    expect(screen.getByText('fui')).toBeInTheDocument()
  })

  it('fires onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(<AnswerOption onSelect={onSelect}>fui</AnswerOption>)
    await userEvent.click(screen.getByRole('button', { name: 'fui' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders a check badge only for the correct status', () => {
    const { container } = render(<AnswerOption status="correct">fui</AnswerOption>)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders an x badge only for the wrong status', () => {
    const { container } = render(<AnswerOption status="wrong">fui</AnswerOption>)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })
})
