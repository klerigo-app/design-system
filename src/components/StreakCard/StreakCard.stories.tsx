import type { Meta, StoryObj } from '@storybook/react-vite'
import { StreakCard } from './StreakCard'

const meta: Meta<typeof StreakCard> = {
  title: 'Learning/StreakCard',
  component: StreakCard,
  args: {
    days: 12,
    title: 'Racha de 12 días',
    subtitle: '¡Sigue así, lo estás haciendo genial!',
    dayLetters: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    activeDays: [true, true, true, true, true, false, false],
  },
}
export default meta

type Story = StoryObj<typeof StreakCard>

export const Default: Story = {}
