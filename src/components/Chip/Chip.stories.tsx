import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from './Chip'

const meta: Meta<typeof Chip> = {
  title: 'Core/Chip',
  component: Chip,
  argTypes: {
    variant: {
      control: 'select',
      options: ['level', 'category', 'new', 'completed', 'live', 'dark', 'outline'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Chip>

export const Level: Story = { args: { variant: 'level', children: 'A2 · Elemental' } }
export const Category: Story = { args: { variant: 'category', children: 'Gramática' } }
export const New: Story = { args: { variant: 'new', children: 'Nuevo' } }
export const Completed: Story = { args: { variant: 'completed', children: 'Completado' } }
export const Live: Story = { args: { variant: 'live', children: 'En vivo' } }
export const Dark: Story = { args: { variant: 'dark', children: 'Oscuro' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Contorno' } }
