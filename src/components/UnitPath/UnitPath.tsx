import { CheckIcon, LockIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { colors } from '../../tokens/tokens'

export type UnitNodeState = 'completed' | 'current' | 'locked'

export interface UnitNode {
  label: string
  state: UnitNodeState
}

export interface UnitPathProps {
  nodes: UnitNode[]
}

function Connector({ fromState, toState }: { fromState: UnitNodeState; toState: UnitNodeState }) {
  if (fromState === 'completed' && toState === 'locked') {
    return (
      <div
        data-connector
        className="flex-1 h-1 rounded-md"
        style={{ background: `linear-gradient(90deg, ${colors.teal[500]} 50%, #E7EFEF 50%)` }}
      />
    )
  }
  if (fromState === 'completed') {
    return <div data-connector className="flex-1 h-1 rounded-md bg-teal-500" />
  }
  return <div data-connector className="flex-1 h-1 rounded-md bg-[#E7EFEF]" />
}

export function UnitPath({ nodes }: UnitPathProps) {
  return (
    <div className="flex items-center w-full">
      {nodes.map((node, index) => (
        <div key={`${node.label}-${index}`} className="flex items-center flex-1 last:flex-none">
          <div
            data-testid={`unit-node-${node.state}`}
            className={clsx(
              'flex items-center justify-center rounded-full shrink-0 font-display',
              node.state === 'completed' && 'w-14 h-14 bg-teal-500',
              node.state === 'current' && 'w-16 h-16 bg-coral-500 shadow-[0_0_0_5px_#FBD3CB]',
              node.state === 'locked' &&
                'w-14 h-14 bg-white border-2 border-dashed border-[#D8CDB6] opacity-[0.55]',
            )}
          >
            {node.state === 'completed' && <CheckIcon weight="bold" className="w-6 h-6 text-white" />}
            {node.state === 'current' && <span className="text-white font-semibold">{node.label}</span>}
            {node.state === 'locked' && <LockIcon className="w-5 h-5 text-muted" />}
          </div>
          {index < nodes.length - 1 && (
            <Connector fromState={node.state} toState={nodes[index + 1].state} />
          )}
        </div>
      ))}
    </div>
  )
}
