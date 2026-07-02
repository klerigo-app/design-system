import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqAccordion, type FaqAccordionItem } from './FaqAccordion'

describe('FaqAccordion', () => {
  const sampleItems: FaqAccordionItem[] = [
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee on all purchases.',
    },
    {
      question: 'Do you offer shipping internationally?',
      answer: 'Yes, we ship to most countries worldwide.',
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach us via email, phone, or our online chat.',
    },
  ]

  it('renders all question texts for a sample items array', () => {
    render(<FaqAccordion items={sampleItems} />)

    expect(screen.getByText('What is your refund policy?')).toBeInTheDocument()
    expect(screen.getByText('Do you offer shipping internationally?')).toBeInTheDocument()
    expect(screen.getByText('How can I contact customer support?')).toBeInTheDocument()
  })

  it('has the first item with aria-expanded="true" by default', () => {
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
  })

  it('has the other items with aria-expanded="false" by default', () => {
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens a closed header when clicked and closes the previously open one', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')

    // Click the second button
    await user.click(buttons[1])

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the currently open header when clicked again', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')

    // First button starts open
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')

    // Click it again to close it
    await user.click(buttons[0])

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
  })

  it('leaves no item with aria-expanded="true" after closing the open header', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')

    // Click the open button to close it
    await user.click(buttons[0])

    // All buttons should be false
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('has exactly one header with aria-expanded="true" in the default state', () => {
    render(<FaqAccordion items={sampleItems} />)

    const buttons = screen.getAllByRole('button')
    const openButtons = buttons.filter((button) => button.getAttribute('aria-expanded') === 'true')

    expect(openButtons).toHaveLength(1)
  })
})
