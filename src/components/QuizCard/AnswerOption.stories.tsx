import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnswerOption } from './AnswerOption'

const meta: Meta<typeof AnswerOption> = {
  title: 'Learning/AnswerOption',
  component: AnswerOption,
  argTypes: {
    status: { control: 'select', options: ['default', 'selected', 'correct', 'wrong'] },
  },
  args: { children: 'fui' },
}
export default meta

type Story = StoryObj<typeof AnswerOption>

export const Default: Story = { args: { status: 'default' } }
export const Selected: Story = { args: { status: 'selected' } }
export const Correct: Story = { args: { status: 'correct' } }
export const Wrong: Story = { args: { status: 'wrong' } }
