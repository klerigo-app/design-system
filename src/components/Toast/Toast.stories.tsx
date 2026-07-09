import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Toast } from './Toast'
import { ToastProvider } from './ToastProvider'
import { useToast } from './useToast'
import type { ToastOptions } from './types'

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
  },
  args: {
    onDismiss: () => {},
  },
}
export default meta

type Story = StoryObj<typeof Toast>

// Static previews of a single toast (drain shelf visible via `duration`).
function Preview(args: Parameters<typeof Toast>[0]) {
  return (
    <div className="max-w-[380px]">
      <Toast {...args} />
    </div>
  )
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Nueva unidad disponible',
    body: 'Ya puedes empezar «Verbos irregulares».',
    links: [{ label: 'Ver unidad', onClick: () => {} }],
    duration: 5000,
  },
  render: Preview,
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Lección guardada',
    body: 'Tu progreso se ha sincronizado.',
    duration: 5000,
  },
  render: Preview,
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Sin conexión',
    body: 'Guardaremos tus respuestas y las enviaremos al reconectar.',
    duration: 5000,
  },
  render: Preview,
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'No se pudo guardar',
    body: 'Revisa tu conexión e inténtalo de nuevo.',
    links: [{ label: 'Reintentar', onClick: () => {} }],
    duration: null,
  },
  render: Preview,
}

// Live playground: fire real toasts through the provider into the bottom-right
// viewport. Hover or tab into the stack to pause the countdown.
function ToastPlayground() {
  const { toast, dismissAll } = useToast()
  const fire = (options: ToastOptions) => () => toast(options)
  return (
    <div className="flex min-h-[70vh] flex-wrap content-start gap-3 bg-paper p-8">
      <Button
        variant="secondary"
        onClick={fire({
          variant: 'info',
          title: 'Nueva unidad disponible',
          body: 'Ya puedes empezar «Verbos irregulares».',
          links: [{ label: 'Ver unidad', onClick: () => {} }],
        })}
      >
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={fire({
          variant: 'success',
          title: 'Lección guardada',
          body: 'Tu progreso se ha sincronizado.',
        })}
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={fire({
          variant: 'warning',
          title: 'Sin conexión',
          body: 'Guardaremos tus respuestas y las enviaremos al reconectar.',
        })}
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={fire({
          variant: 'error',
          title: 'No se pudo guardar',
          body: 'Revisa tu conexión e inténtalo de nuevo.',
          links: [{ label: 'Reintentar', onClick: () => {} }],
        })}
      >
        Error (persiste)
      </Button>
      <Button variant="ghost" onClick={dismissAll}>
        Limpiar
      </Button>
    </div>
  )
}

export const Interactive: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ToastProvider>
      <ToastPlayground />
    </ToastProvider>
  ),
}
