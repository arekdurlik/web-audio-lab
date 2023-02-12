import { Connection, Edge, Handle, Position } from 'reactflow'
import { NumberInput } from '../NumberInput'
import { NodeProps } from './types'
import { NodeContainer, NodeTitle } from './styled'
import { useNodeStore } from '../nodeStore'
import { audio } from '../main'
import { useEffect } from 'react'

export function LiveInput(props: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('liveInput', audio.circuit.in)
  }, [])

  return (
    <NodeContainer>
      <NodeTitle>Live Input</NodeTitle>
      <Handle
        type="source"
        position={Position.Right}
        style={{ top: 22.5 }}
      />
    </NodeContainer>
  )
}

