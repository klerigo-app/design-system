import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuizCard } from './QuizCard'
import { AnswerOption, type AnswerOptionStatus } from './AnswerOption'

const meta: Meta<typeof QuizCard> = {
  title: 'Learning/QuizCard',
  component: QuizCard,
}
export default meta

type Story = StoryObj<typeof QuizCard>

export const Default: Story = {
  render: () => {
    const options = ['fui', 'fue', 'iba'] as const
    const [selected, setSelected] = useState<(typeof options)[number] | null>(null)
    const statusFor = (option: string): AnswerOptionStatus =>
      selected === option ? 'selected' : 'default'
    return (
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine con mis amigos."
        submitLabel="Comprobar"
        onSubmit={() => {}}
      >
        {options.map((option) => (
          <AnswerOption
            key={option}
            status={statusFor(option)}
            onSelect={() => setSelected(option)}
          >
            {option}
          </AnswerOption>
        ))}
      </QuizCard>
    )
  },
}

export const AnswerStates: Story = {
  render: () => (
    <QuizCard
      current={2}
      total={5}
      promptLabel="Completa la frase"
      question="Ayer yo ___ al cine."
      submitLabel="Comprobar"
    >
      <AnswerOption status="correct">fui</AnswerOption>
      <AnswerOption status="wrong">fue</AnswerOption>
      <AnswerOption status="default">iba</AnswerOption>
    </QuizCard>
  ),
}

export const WithBack: Story = {
  render: () => {
    const options = ['fui', 'fue', 'iba'] as const
    const [selected, setSelected] = useState<(typeof options)[number] | null>('fui')
    const statusFor = (option: string): AnswerOptionStatus =>
      selected === option ? 'selected' : 'default'
    return (
      <QuizCard
        current={3}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine con mis amigos."
        submitLabel="Continue"
        onSubmit={() => {}}
        onBack={() => {}}
      >
        {options.map((option) => (
          <AnswerOption
            key={option}
            status={statusFor(option)}
            onSelect={() => setSelected(option)}
          >
            {option}
          </AnswerOption>
        ))}
      </QuizCard>
    )
  },
}
