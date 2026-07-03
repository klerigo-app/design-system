import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const meta: Meta<typeof SegmentedControl> = {
  title: 'Core/SegmentedControl',
  component: SegmentedControl,
}
export default meta

type Story = StoryObj<typeof SegmentedControl>

function DefaultWrapper() {
  const [value, setValue] = useState('cz')
  return (
    <SegmentedControl
      options={[
        { value: 'cz', label: 'CZ' },
        { value: 'es', label: 'ES' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultWrapper />,
}

function ThreeOptionsWrapper() {
  const [value, setValue] = useState('en')
  return (
    <SegmentedControl
      options={[
        { value: 'en', label: 'EN' },
        { value: 'cz', label: 'CZ' },
        { value: 'es', label: 'ES' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

export const ThreeOptions: Story = {
  render: () => <ThreeOptionsWrapper />,
}
