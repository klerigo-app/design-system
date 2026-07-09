import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { TextInput } from '../TextInput/TextInput'
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
    size: { control: 'select', options: ['md', 'lg'] },
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

export const WideWithSideBySideFields: Story = {
  args: {
    size: 'lg',
    title: 'Editar usuario',
    description: 'Actualiza los datos de este usuario.',
    confirmText: 'Guardar',
  },
  render: (args) => (
    <Modal {...args} isOpen onClose={() => {}}>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <TextInput id="story-first-name" label="Nombre" defaultValue="Sam" required />
        </div>
        <div className="min-w-0 flex-1">
          <TextInput id="story-last-name" label="Apellido" defaultValue="Student" />
        </div>
      </div>
    </Modal>
  ),
}
