import type { Meta, StoryObj } from '@storybook/react-vite'
import { LessonCard } from './LessonCard'

const meta: Meta<typeof LessonCard> = {
  title: 'Learning/LessonCard',
  component: LessonCard,
  args: {
    number: 6,
    levelLabel: 'A2 · Elemental',
    categoryLabel: 'Gramática',
    duration: '8 min',
    title: 'El pretérito indefinido',
    subtitle: 'Aprende a conjugar verbos regulares en pasado',
    progress: 6,
    progressMax: 10,
    actionLabel: 'Seguir',
  },
}
export default meta

type Story = StoryObj<typeof LessonCard>

export const Default: Story = {}
