import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from './SearchField'

const meta: Meta<typeof SearchField> = {
  title: 'Core/SearchField',
  component: SearchField,
  args: { id: 'search', 'aria-label': 'Buscar lecciones', placeholder: 'Buscar lecciones...' },
}
export default meta

type Story = StoryObj<typeof SearchField>

export const Default: Story = {}
