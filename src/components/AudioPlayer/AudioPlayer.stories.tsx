import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioPlayer } from './AudioPlayer'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Learning/AudioPlayer',
  component: AudioPlayer,
}
export default meta

type Story = StoryObj<typeof AudioPlayer>

export const Default: Story = {
  render: () => {
    const duration = 154
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(37)
    return (
      <div style={{ maxWidth: 480 }}>
        <AudioPlayer
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={() => setIsPlaying((playing) => !playing)}
          onSeek={setCurrentTime}
        />
      </div>
    )
  },
}

export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <AudioPlayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        onTogglePlay={() => {}}
        onSeek={() => {}}
        label="Listening exercise"
      />
    </div>
  ),
}
