import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Core/TextInput',
  component: TextInput,
  args: { id: 'name', label: 'Nombre' },
}
export default meta

type Story = StoryObj<typeof TextInput>

export const Default: Story = {}
export const WithHelperText: Story = { args: { helperText: 'Como aparece en tu documento' } }
export const WithError: Story = { args: { error: 'Este campo es obligatorio' } }
