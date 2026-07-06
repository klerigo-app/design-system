import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'

const meta: Meta<typeof Heading> = {
  title: 'Core/Heading',
  component: Heading,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    as: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'] },
  },
}
export default meta

type Story = StoryObj<typeof Heading>

export const ExtraLarge: Story = { args: { size: 'xl', children: 'Aprende español con alegría' } }
export const Large: Story = { args: { size: 'lg', children: 'Tu progreso de la semana' } }
export const Medium: Story = { args: { size: 'md', children: 'Lección 3 · Saludos' } }
export const Small: Story = { args: { size: 'sm', children: 'Vocabulario nuevo' } }
