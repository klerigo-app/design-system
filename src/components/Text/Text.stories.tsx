import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './Text'

const meta: Meta<typeof Text> = {
  title: 'Core/Text',
  component: Text,
  argTypes: {
    variant: { control: 'select', options: ['body', 'muted', 'kicker'] },
    as: { control: 'select', options: ['p', 'span', 'div'] },
  },
}
export default meta

type Story = StoryObj<typeof Text>

export const Body: Story = { args: { children: 'Aprender un idioma es un viaje, no una carrera.' } }
export const Muted: Story = { args: { variant: 'muted', children: 'Última lección hace 2 días' } }
export const Kicker: Story = { args: { variant: 'kicker', children: 'Cómo funciona' } }
