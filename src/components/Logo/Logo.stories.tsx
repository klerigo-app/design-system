import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'
import { LogoMark } from './LogoMark'

const meta: Meta<typeof Logo> = {
  title: 'Brand/Logo',
  component: Logo,
  argTypes: {
    variant: { control: 'select', options: ['coral', 'knockout', 'outline'] },
    orientation: { control: 'select', options: ['horizontal', 'stacked'] },
  },
}
export default meta

type Story = StoryObj<typeof Logo>

export const Horizontal: Story = { args: { orientation: 'horizontal' } }
export const Stacked: Story = { args: { orientation: 'stacked' } }
export const Knockout: Story = {
  args: { variant: 'knockout' },
  decorators: [
    (Story) => (
      <div style={{ background: '#1F2933', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export const MarkOnly: StoryObj<typeof LogoMark> = {
  render: (args) => <LogoMark {...args} />,
  args: { size: 160, variant: 'coral' },
}
