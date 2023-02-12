import { Connection, Edge, Handle, Position } from 'reactflow'
import { NumberInput } from '../NumberInput'
import { NodeProps } from './types'
import { NodeContainer, NodeTitle } from './styled'
import { useEffect } from 'react'
import { useNodeStore } from '../nodeStore'
import { audio } from '../main'

export function Destination(props: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('destination', audio.circuit.out)
  }, [])

  return (
    <NodeContainer>
      <NodeTitle>Output</NodeTitle>
      <Handle
        type="target"
        position={Position.Left}
        style={{ top: 22.5 }}
      />
    </NodeContainer>
  )
}

