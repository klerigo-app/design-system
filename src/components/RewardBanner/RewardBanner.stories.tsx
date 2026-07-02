import type { Meta, StoryObj } from '@storybook/react-vite'
import { RewardBanner } from './RewardBanner'

const meta: Meta<typeof RewardBanner> = {
  title: 'Learning/RewardBanner',
  component: RewardBanner,
  args: { title: '¡Lección completada!', subtitle: '+50 XP · Nuevo logro' },
}
export default meta

type Story = StoryObj<typeof RewardBanner>

export const Default: Story = {}
