import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Learning/ProgressBar',
  component: ProgressBar,
  argTypes: {
    variant: { control: 'select', options: ['teal', 'xp-gradient'] },
  },
  args: { value: 6, max: 10 },
}
export default meta

type Story = StoryObj<typeof ProgressBar>

export const Teal: Story = { args: { variant: 'teal' } }
export const XpGradient: Story = { args: { variant: 'xp-gradient' } }
