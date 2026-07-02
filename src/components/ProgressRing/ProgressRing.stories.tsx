import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressRing } from './ProgressRing'

const meta: Meta<typeof ProgressRing> = {
  title: 'Learning/ProgressRing',
  component: ProgressRing,
  args: { percent: 62, caption: 'de la unidad' },
}
export default meta

type Story = StoryObj<typeof ProgressRing>

export const Default: Story = {}
export const CustomLabel: Story = { args: { label: 'Unidad 3', caption: undefined } }
