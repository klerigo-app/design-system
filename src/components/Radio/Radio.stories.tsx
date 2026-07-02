import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio } from './Radio'

const meta: Meta<typeof Radio> = {
  title: 'Core/Radio',
  component: Radio,
  args: { id: 'online', name: 'mode', label: 'En línea' },
}
export default meta

type Story = StoryObj<typeof Radio>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
