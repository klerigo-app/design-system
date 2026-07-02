import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const options = [
  { value: 'a1', label: 'A1 · Principiante' },
  { value: 'a2', label: 'A2 · Elemental' },
  { value: 'b1', label: 'B1 · Intermedio' },
]

const meta: Meta<typeof Select> = {
  title: 'Core/Select',
  component: Select,
  args: { id: 'level', label: 'Nivel', options },
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {}
export const WithError: Story = { args: { error: 'Elige un nivel' } }
