import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Toast } from './Toast'
import { ToastProvider } from './ToastProvider'
import { useToast } from './useToast'
import type { ToastOptions } from './types'

describe('Toast (presentational)', () => {
  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['error', 'alert'],
  ] as const)('renders the %s variant as a %s live region', (variant, role) => {
    render(<Toast variant={variant} title="Título" onDismiss={vi.fn()} />)
    expect(screen.getByRole(role)).toBeInTheDocument()
  })

  it('renders title and body', () => {
    render(
      <Toast title="Lección guardada" body="Tu progreso se ha sincronizado." onDismiss={vi.fn()} />,
    )
    expect(screen.getByText('Lección guardada')).toBeInTheDocument()
    expect(screen.getByText('Tu progreso se ha sincronizado.')).toBeInTheDocument()
  })

  it('fires onDismiss when the close button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Toast title="Título" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByLabelText('Cerrar'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('renders footer links and fires their onClick', () => {
    const onClick = vi.fn()
    render(<Toast title="Título" links={[{ label: 'Reintentar', onClick }]} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByText('Reintentar'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a link as an anchor when href is set', () => {
    render(
      <Toast title="Título" links={[{ label: 'Ver unidad', href: '/unit' }]} onDismiss={vi.fn()} />,
    )
    expect(screen.getByText('Ver unidad').closest('a')).toHaveAttribute('href', '/unit')
  })

  it('shows the countdown shelf only when a duration is set', () => {
    const persistent = render(<Toast title="Título" duration={null} onDismiss={vi.fn()} />)
    expect(persistent.container.querySelector('.animate-toast-drain')).toBeNull()

    const timed = render(<Toast title="Título" duration={5000} onDismiss={vi.fn()} />)
    expect(timed.container.querySelector('.animate-toast-drain')).not.toBeNull()
  })
})

function Harness() {
  const { toast, dismissAll } = useToast()
  const fire = (options: ToastOptions) => () => toast(options)
  return (
    <div>
      <button onClick={fire({ variant: 'success', title: 'Guardado', body: 'Listo' })}>
        fire success
      </button>
      <button onClick={fire({ variant: 'error', title: 'Falló', body: 'Revisa la conexión' })}>
        fire error
      </button>
      <button onClick={fire({ variant: 'error', title: 'Falló rápido', duration: 3000 })}>
        fire error 3s
      </button>
      <button onClick={dismissAll}>clear</button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('shows a toast fired through useToast', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire success'))
    })
    expect(screen.getByText('Guardado')).toBeInTheDocument()
  })

  it('auto-dismisses a non-error toast after the default 5s', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire success'))
    })
    expect(screen.getByText('Guardado')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4999)
    })
    expect(screen.getByText('Guardado')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByText('Guardado')).not.toBeInTheDocument()
  })

  it('keeps an error toast until it is dismissed', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire error'))
    })
    act(() => {
      vi.advanceTimersByTime(60000)
    })
    expect(screen.getByText('Falló')).toBeInTheDocument()
  })

  it('honors an explicit duration override on an error toast', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire error 3s'))
    })
    expect(screen.getByText('Falló rápido')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Falló rápido')).not.toBeInTheDocument()
  })

  it('pauses auto-dismiss while the viewport is hovered and banks the remaining time on leave', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire success'))
    })
    const viewport = screen.getByText('Guardado').closest('.fixed') as HTMLElement

    // 2s in, hover the stack — the remaining ~3s freezes.
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      fireEvent.mouseEnter(viewport)
    })
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(screen.getByText('Guardado')).toBeInTheDocument()

    // Leaving resumes (re-arms the timer); only the banked ~3s should remain.
    act(() => {
      fireEvent.mouseLeave(viewport)
    })
    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(screen.getByText('Guardado')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByText('Guardado')).not.toBeInTheDocument()
  })

  it('dismisses a toast when its close button is clicked', () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire error'))
    })
    act(() => {
      fireEvent.click(screen.getByLabelText('Cerrar'))
    })
    expect(screen.queryByText('Falló')).not.toBeInTheDocument()
  })

  it('caps the number of visible toasts at max', () => {
    render(
      <ToastProvider max={2}>
        <Harness />
      </ToastProvider>,
    )
    act(() => {
      fireEvent.click(screen.getByText('fire error'))
      fireEvent.click(screen.getByText('fire error'))
      fireEvent.click(screen.getByText('fire error'))
    })
    expect(screen.getAllByText('Falló')).toHaveLength(2)
  })

  it('throws when useToast is called outside a provider', () => {
    function Orphan() {
      useToast()
      return null
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Orphan />)).toThrow(/ToastProvider/)
    spy.mockRestore()
  })
})
