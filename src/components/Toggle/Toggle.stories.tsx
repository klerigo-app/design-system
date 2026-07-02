import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Core/Toggle',
  component: Toggle,
  args: { id: 'notifications', label: 'Notificaciones' },
}
export default meta

type Story = StoryObj<typeof Toggle>

export const Off: Story = {}
export const On: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
