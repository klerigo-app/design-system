import type { ReactElement } from 'react'
import { CheckIcon, LockIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'

export type UnitNodeState = 'completed' | 'current' | 'locked'

export interface UnitNode {
  label: string
  state: UnitNodeState
}

export interface UnitPathProps {
  nodes: UnitNode[]
}

function Connector({
  fromState,
  toState,
}: {
  fromState: UnitNodeState
  toState: UnitNodeState
}): ReactElement {
  if (fromState === 'completed' && toState === 'locked') {
    return (
      <div
        data-connector
        className="h-1 flex-1 rounded-md"
        style={{
          // Custom properties, not JS token values — the JS palette is light-only,
          // so a baked gradient string left this half-connector frozen in dark.
          background: `linear-gradient(90deg, var(--color-teal-500) 50%, var(--color-connector-locked) 50%)`,
        }}
      />
    )
  }
  if (fromState === 'completed') {
    return <div data-connector className="h-1 flex-1 rounded-md bg-teal-500" />
  }
  return <div data-connector className="h-1 flex-1 rounded-md bg-connector-locked" />
}

export function UnitPath({ nodes }: UnitPathProps): ReactElement {
  return (
    <div className="flex w-full items-center">
      {nodes.map((node, index) => (
        <div key={`${node.label}-${index}`} className="flex flex-1 items-center last:flex-none">
          <div
            data-testid={`unit-node-${node.state}`}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full font-display',
              node.state === 'completed' && 'h-14 w-14 bg-teal-500',
              node.state === 'current' && 'h-16 w-16 bg-coral-500 shadow-[0_0_0_5px_#FBD3CB]',
              node.state === 'locked' &&
                'h-14 w-14 border-2 border-dashed border-node-locked-border bg-surface-raised opacity-[0.55]',
            )}
          >
            {node.state === 'completed' && (
              <CheckIcon weight="bold" className="h-6 w-6 text-white" />
            )}
            {node.state === 'current' && (
              <span className="font-semibold text-white">{node.label}</span>
            )}
            {node.state === 'locked' && <LockIcon className="h-5 w-5 text-muted" />}
          </div>
          {index < nodes.length - 1 && (
            <Connector fromState={node.state} toState={nodes[index + 1].state} />
          )}
        </div>
      ))}
    </div>
  )
}
