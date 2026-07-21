import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'design', label: 'Diseño' },
  { value: 'engineering', label: 'Ingeniería' },
  { value: 'product', label: 'Producto' },
]

describe('MultiSelect', () => {
  it('associates the label with the trigger and shows the placeholder when empty', () => {
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={[]}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Habilidades')).toHaveTextContent('Selecciona opciones')
  })

  it('opens the option list on trigger click', async () => {
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={[]}
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Habilidades' }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Diseño' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Ingeniería' })).toBeInTheDocument()
  })

  it('calls onChange with the option added when an unchecked option is toggled', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={['design']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ingeniería' }))

    expect(onChange).toHaveBeenCalledWith(['design', 'engineering'])
  })

  it('calls onChange with the option removed when a checked option is toggled', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={['design', 'product']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Diseño' }))

    expect(onChange).toHaveBeenCalledWith(['product'])
  })

  it('shows a comma-joined summary of selected labels in the trigger', () => {
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={['design', 'product']}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Habilidades')).toHaveTextContent('Diseño, Producto')
  })

  it('renders a passed helperText', () => {
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={[]}
        onChange={vi.fn()}
        helperText="2 seleccionadas"
      />,
    )
    expect(screen.getByText('2 seleccionadas')).toBeInTheDocument()
  })

  it('closes the panel on outside click', async () => {
    render(
      <div>
        <MultiSelect
          id="skills"
          label="Habilidades"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />
        <button>Fuera</button>
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Habilidades' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Fuera' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the panel on Escape', async () => {
    render(
      <MultiSelect
        id="skills"
        label="Habilidades"
        placeholder="Selecciona opciones"
        options={options}
        value={[]}
        onChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Habilidades' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
