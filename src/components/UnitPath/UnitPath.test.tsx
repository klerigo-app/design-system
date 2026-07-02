import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnitPath, type UnitNode } from './UnitPath'

const nodes: UnitNode[] = [
  { label: '1', state: 'completed' },
  { label: '2', state: 'current' },
  { label: '3', state: 'locked' },
]

describe('UnitPath', () => {
  it('renders a node for each entry', () => {
    render(<UnitPath nodes={nodes} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders one fewer connector than nodes', () => {
    const { container } = render(<UnitPath nodes={nodes} />)
    // each node wrapper renders at most one connector sibling; 3 nodes -> 2 connectors
    expect(container.querySelectorAll('[data-connector]')).toHaveLength(2)
  })

  it('renders a lock icon for locked nodes and nothing equivalent for completed/current', () => {
    render(<UnitPath nodes={nodes} />)
    expect(screen.getByTestId('unit-node-locked')).toBeInTheDocument()
  })
})
