import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Modal, type ModalProps } from './Modal'

function ModalDemo(props: Omit<ModalProps, 'isOpen' | 'onClose'>) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir modal</Button>
      <Modal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

const meta: Meta<typeof Modal> = {
  title: 'Core/Modal',
  component: ModalDemo,
  argTypes: {
    variant: { control: 'select', options: ['info', 'warning', 'error', 'success'] },
  },
  args: {
    title: '¿Eliminar la lección?',
    description: 'Esta acción no se puede deshacer.',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    onCancel: () => {},
  },
}
export default meta

type Story = StoryObj<typeof ModalDemo>

export const Info: Story = { args: { variant: 'info' } }
export const Warning: Story = { args: { variant: 'warning' } }
export const Error: Story = { args: { variant: 'error' } }
export const Success: Story = { args: { variant: 'success' } }

export const ConfirmOnly: Story = {
  args: {
    variant: 'success',
    title: 'Lección completada',
    description: '¡Buen trabajo! Sigues sumando racha.',
    confirmText: 'OK',
    onCancel: undefined,
  },
}

export const TypeToConfirmDelete: Story = {
  args: {
    variant: 'error',
    title: 'Eliminar unidad "Verbos irregulares"',
    description: 'Esta acción eliminará la unidad y todo su progreso de forma permanente.',
    confirmText: 'Eliminar',
    confirmationValue: 'Verbos irregulares',
  },
}
