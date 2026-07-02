import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizCard } from './QuizCard'
import { AnswerOption } from './AnswerOption'

describe('QuizCard', () => {
  it('renders the counter, prompt label, and question', () => {
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine."
        submitLabel="Comprobar"
      >
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.getByText('Completa la frase')).toBeInTheDocument()
    expect(screen.getByText('Ayer yo ___ al cine.')).toBeInTheDocument()
  })

  it('renders the answer options passed as children', () => {
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine."
        submitLabel="Comprobar"
      >
        <AnswerOption>fui</AnswerOption>
        <AnswerOption>fue</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByRole('button', { name: 'fui' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fue' })).toBeInTheDocument()
  })

  it('fires onSubmit when the submit button is clicked', async () => {
    const onSubmit = vi.fn()
    render(
      <QuizCard current={2} total={5} promptLabel="p" question="q" submitLabel="Comprobar" onSubmit={onSubmit}>
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables the submit button when submitDisabled is set', async () => {
    const onSubmit = vi.fn()
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="p"
        question="q"
        submitLabel="Comprobar"
        onSubmit={onSubmit}
        submitDisabled
      >
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('uses the given submit label', () => {
    render(
      <QuizCard current={2} total={5} promptLabel="p" question="q" submitLabel="Enviar">
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })
})
