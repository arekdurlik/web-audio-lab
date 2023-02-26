import { NodeProps } from './types'
import { useEffect, useState } from 'react'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { HandleType } from 'reactflow'
import { SocketOnly } from './SocketOnlyNode'

export function LiveInput({ id, data }: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('liveInput', { instance: audio.circuit.in, type: 'source' })
  }, [])

  const socket ={
    id: 'liveInput',
    type: 'source' as HandleType,
    offset: 20
  }

  return (
    <SocketOnly 
      id={id} 
      label='Live in'
      data={data} 
      socket={socket}
    />
  )
}
