import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchField } from './SearchField'

describe('SearchField', () => {
  it('renders a search input with the given accessible label', () => {
    render(<SearchField id="search" aria-label="Buscar lecciones" placeholder="Buscar..." />)
    expect(screen.getByRole('searchbox', { name: 'Buscar lecciones' })).toBeInTheDocument()
  })

  it('uses the given placeholder', () => {
    render(<SearchField id="search" aria-label="Buscar lecciones" placeholder="Gramática..." />)
    expect(screen.getByPlaceholderText('Gramática...')).toBeInTheDocument()
  })

  it('fires onChange as the user types', async () => {
    const onChange = vi.fn()
    render(
      <SearchField
        id="search"
        aria-label="Buscar lecciones"
        placeholder="Buscar..."
        onChange={onChange}
      />,
    )
    await userEvent.type(screen.getByRole('searchbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })
})
