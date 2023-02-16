import { NodeProps } from './types'
import { useEffect } from 'react'
import styled from 'styled-components'
import { Node } from './Node'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'

export function LiveInput({ id, data }: NodeProps) {
  const nodes = useNodeStore(state => state.nodes)
  
  useEffect(() => {
    nodes.set('liveInput', audio.circuit.in)
  }, [])

  return (
    <Node 
      id={id}
      name={<Title>Live Input<Recording/></Title>}
      height={40}
      width={140}
      data={data}
      sockets={[{
        id: 'liveInput',
        type: 'source',
        edge: 'right',
        offset: 20
      }]}
      disableRemoval
    />
  )
}

const Title = styled.div`
display: flex;
gap: 5px;
align-items: center;
`
const Recording = styled.div`
width: 10px;
height: 10px;
background-color: #f00;
border-radius: 100%;
`

