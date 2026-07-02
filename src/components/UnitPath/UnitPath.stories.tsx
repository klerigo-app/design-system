import type { Meta, StoryObj } from '@storybook/react-vite'
import { UnitPath } from './UnitPath'

const meta: Meta<typeof UnitPath> = {
  title: 'Learning/UnitPath',
  component: UnitPath,
  args: {
    nodes: [
      { label: '1', state: 'completed' },
      { label: '2', state: 'completed' },
      { label: '3', state: 'current' },
      { label: '4', state: 'locked' },
      { label: '5', state: 'locked' },
    ],
  },
}
export default meta

type Story = StoryObj<typeof UnitPath>

export const Default: Story = {}
