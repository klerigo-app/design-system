import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['flat', 'elevated', 'feature'] },
    interactive: { control: 'boolean' },
    decorativeCircle: { control: 'boolean' },
  },
  args: { children: 'Contenido de la tarjeta' },
}
export default meta

type Story = StoryObj<typeof Card>

export const Flat: Story = { args: { variant: 'flat' } }
export const Elevated: Story = { args: { variant: 'elevated' } }
export const InteractiveElevated: Story = { args: { variant: 'elevated', interactive: true } }
export const Feature: Story = { args: { variant: 'feature', decorativeCircle: true } }
