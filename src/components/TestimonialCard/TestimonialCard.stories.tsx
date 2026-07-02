import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestimonialCard } from './TestimonialCard'

const meta: Meta<typeof TestimonialCard> = {
  title: 'Marketing/TestimonialCard',
  component: TestimonialCard,
  argTypes: {
    rating: { control: 'number', min: 0, max: 5, step: 1 },
  },
}
export default meta

type Story = StoryObj<typeof TestimonialCard>

export const Default: Story = {
  args: {
    rating: 5,
    quote: 'Con Lenka empecé a hablar en seis meses más que en años en la escuela. Las clases son divertidas y personalizadas.',
    name: 'Jana K.',
    role: 'nivel B1',
  },
}

export const PartialRating: Story = {
  args: {
    rating: 4,
    quote: 'La app me hizo practicar cada día. Por fin fui constante con el español.',
    name: 'Petr M.',
    role: 'principiante',
  },
}

export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}
    >
      <TestimonialCard
        rating={5}
        quote="Con Lenka empecé a hablar en seis meses más que en años en la escuela. Las clases son divertidas y personalizadas."
        name="Jana K."
        role="nivel B1"
      />
      <TestimonialCard
        rating={4}
        quote="La app me hizo practicar cada día. Por fin fui constante con el español."
        name="Petr M."
        role="principiante"
      />
      <TestimonialCard
        rating={5}
        quote="Excelente método de enseñanza. Muy recomendado para todos."
        name="María T."
        role="nivel A2"
      />
    </div>
  ),
}
