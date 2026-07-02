import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonCard } from './LessonCard'

const baseProps = {
  number: 6,
  levelLabel: 'A2 · Elemental',
  categoryLabel: 'Gramática',
  duration: '8 min',
  title: 'El pretérito indefinido',
  subtitle: 'Aprende a conjugar verbos regulares',
  progress: 6,
  progressMax: 10,
  actionLabel: 'Seguir',
}

describe('LessonCard', () => {
  it('renders the lesson number, title, subtitle, and progress fraction', () => {
    render(<LessonCard {...baseProps} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('El pretérito indefinido')).toBeInTheDocument()
    expect(screen.getByText('Aprende a conjugar verbos regulares')).toBeInTheDocument()
    expect(screen.getByText('6 / 10')).toBeInTheDocument()
  })

  it('renders the level and category chips and the duration', () => {
    render(<LessonCard {...baseProps} />)
    expect(screen.getByText('A2 · Elemental')).toBeInTheDocument()
    expect(screen.getByText('Gramática')).toBeInTheDocument()
    expect(screen.getByText('8 min')).toBeInTheDocument()
  })

  it('fires onAction when the default action button is clicked', async () => {
    const onAction = vi.fn()
    render(<LessonCard {...baseProps} onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: 'Seguir' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders a custom actionSlot instead of the default button when provided', () => {
    render(<LessonCard {...baseProps} actionSlot={<span>Personalizado</span>} />)
    expect(screen.getByText('Personalizado')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Seguir' })).not.toBeInTheDocument()
  })
})
