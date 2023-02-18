import { NodeProps } from './types'
import { useEffect } from 'react'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { SocketOnly } from './SocketOnlyNode'
import { HandleType } from 'reactflow'

export function Destination({id, data}: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('destination', audio.circuit.out)
  }, [])

  const socket ={
    id: 'destination',
    type: 'target' as HandleType,
    offset: 20
  }

  return (
    <SocketOnly 
      id={id} 
      label='Output'
      data={data} 
      defaultRotation={2}
      socket={socket}
    />
  )
}

