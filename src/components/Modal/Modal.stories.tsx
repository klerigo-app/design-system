import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { TextInput } from '../TextInput/TextInput'
import { Modal, type ModalProps } from './Modal'

/**
 * `Omit` does not distribute over a union, so `Omit<ModalProps, ...>` collapses
 * the prop union's branches and nothing satisfies the result. This preserves
 * them. See the note on `ModalProps`.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

function ModalDemo(props: DistributiveOmit<ModalProps, 'isOpen' | 'onClose'>) {
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
    // cancelText goes with onCancel — the prop union does not allow a label for
    // a button that is not rendered.
    onCancel: undefined,
    cancelText: undefined,
  },
}

export const TypeToConfirmDelete: Story = {
  args: {
    variant: 'error',
    title: 'Eliminar unidad "Verbos irregulares"',
    description: 'Esta acción eliminará la unidad y todo su progreso de forma permanente.',
    confirmText: 'Eliminar',
    confirmationValue: 'Verbos irregulares',
    // Required alongside confirmationValue now. This string used to come from a
    // Spanish fallback inside the component.
    confirmationLabel: 'Para confirmar, escribe "Verbos irregulares"',
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
