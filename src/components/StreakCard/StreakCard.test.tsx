import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakCard } from './StreakCard'

const props = {
  days: 12,
  title: 'Racha de 12 días',
  subtitle: '¡Sigue así, lo estás haciendo genial!',
  dayLetters: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  activeDays: [true, true, true, true, true, false, false],
}

describe('StreakCard', () => {
  it('renders the day count, title, and subtitle', () => {
    render(<StreakCard {...props} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Racha de 12 días')).toBeInTheDocument()
    expect(screen.getByText('¡Sigue así, lo estás haciendo genial!')).toBeInTheDocument()
  })

  it('renders one cell per day letter', () => {
    render(<StreakCard {...props} />)
    expect(screen.getAllByText(/^[LMXJVSD]$/)).toHaveLength(7)
  })

  it('renders the same number of cells as day letters even if activeDays is shorter', () => {
    render(<StreakCard {...props} activeDays={[true]} />)
    expect(screen.getAllByText(/^[LMXJVSD]$/)).toHaveLength(7)
  })
})
