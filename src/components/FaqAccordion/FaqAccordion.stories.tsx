import type { Meta, StoryObj } from '@storybook/react-vite'
import { FaqAccordion, type FaqAccordionItem } from './FaqAccordion'

const meta: Meta<typeof FaqAccordion> = {
  title: 'Marketing/FaqAccordion',
  component: FaqAccordion,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FaqAccordion>

const sampleItems: FaqAccordionItem[] = [
  {
    question: '¿Cuál es vuestra política de reembolso?',
    answer: 'Ofrecemos una garantía de devolución de dinero de 30 días en todas las compras.',
  },
  {
    question: '¿Enviáis internacionalmente?',
    answer: 'Sí, enviamos a la mayoría de países del mundo.',
  },
  {
    question: '¿Cómo puedo contactar con atención al cliente?',
    answer: 'Puedes contactarnos por correo electrónico, teléfono o nuestro chat en línea.',
  },
]

export const Default: Story = {
  args: {
    items: sampleItems,
  },
}

export const Constrained: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <FaqAccordion {...args} />
    </div>
  ),
}
