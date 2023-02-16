import { NodeProps } from './types'
import { useEffect } from 'react'
import { Node } from './Node'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'

export function Destination({id, data}: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('destination', audio.circuit.out)
  }, [])

  return (
    <Node 
      id={id}
      data={data}
      name='Output'
      height={40}
      sockets={[{
        id: 'destination',
        type: 'target',
        edge: 'left',
        offset: 20
      }]}
      disableRemoval
    />
  )
}

