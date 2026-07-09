import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Título" onConfirm={vi.fn()}>
        Contenido
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with title and description when open', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Título"
        description="Descripción"
        onConfirm={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
  })

  it.each(['info', 'warning', 'error', 'success'] as const)(
    'renders an icon for the %s variant',
    (variant) => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Título" onConfirm={vi.fn()} variant={variant} />,
      )
      expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument()
    },
  )

  it('does not render a Cancel button when onCancel is omitted', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Título" onConfirm={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('renders a Cancel button and fires onCancel when provided', async () => {
    const onCancel = vi.fn()
    render(
      <Modal isOpen onClose={vi.fn()} title="Título" onConfirm={vi.fn()} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('fires onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<Modal isOpen onClose={vi.fn()} title="Título" onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('supports custom confirm/cancel text', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Título"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmText="Eliminar"
        cancelText="Volver"
      />,
    )
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<Modal isOpen onClose={onClose} title="Título" onConfirm={vi.fn()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when closeOnEscape is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Título" onConfirm={vi.fn()} closeOnEscape={false} />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when the overlay is clicked', async () => {
    const onClose = vi.fn()
    render(<Modal isOpen onClose={onClose} title="Título" onConfirm={vi.fn()} />)
    const overlay = document.body.querySelector('div[aria-hidden="true"]')
    expect(overlay).not.toBeNull()
    await userEvent.click(overlay as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('defaults to the md size', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Título" onConfirm={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
  })

  it('applies the lg size when requested', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Título" onConfirm={vi.fn()} size="lg" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('max-w-xl')
    expect(dialog).not.toHaveClass('max-w-md')
  })

  it('keeps confirm disabled until the typed text matches confirmationValue', async () => {
    const onConfirm = vi.fn()
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Eliminar unidad"
        onConfirm={onConfirm}
        confirmationValue="Verbos irregulares"
        confirmText="Eliminar"
      />,
    )
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    const input = screen.getByLabelText('Para confirmar, escribe "Verbos irregulares"')

    expect(confirmButton).toBeDisabled()

    await userEvent.type(input, 'algo incorrecto')
    expect(confirmButton).toBeDisabled()

    await userEvent.clear(input)
    await userEvent.type(input, 'Verbos irregulares')
    expect(confirmButton).toBeEnabled()

    await userEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
