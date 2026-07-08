import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MultiSelect, type MultiSelectProps } from './MultiSelect'

const options = [
  { value: 'design', label: 'Diseño' },
  { value: 'engineering', label: 'Ingeniería' },
  { value: 'product', label: 'Producto' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Ventas' },
]

function MultiSelectDemo({
  defaultValue = [],
  ...props
}: Omit<MultiSelectProps, 'value' | 'onChange'> & { defaultValue?: string[] }) {
  const [value, setValue] = useState<string[]>(defaultValue)
  return <MultiSelect {...props} value={value} onChange={setValue} />
}

const meta: Meta<typeof MultiSelectDemo> = {
  title: 'Core/MultiSelect',
  component: MultiSelectDemo,
  args: { id: 'skills', label: 'Habilidades', options },
}
export default meta

type Story = StoryObj<typeof MultiSelectDemo>

export const Default: Story = {}

export const Preselected: Story = {
  args: { defaultValue: ['design', 'product'], helperText: '2 seleccionadas' },
}
