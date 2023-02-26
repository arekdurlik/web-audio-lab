import { SPDTProps } from '../types'
import { useEffect, useRef, useState } from 'react'
import { useNodeStore } from '../../../stores/nodeStore'
import { audio } from '../../../main'
import { useReactFlow } from 'reactflow'
import { Socket } from '../../nodes/BaseNode/types'
import { Node } from '../../nodes/BaseNode'
import { ConnectionLine, ConnectionWrapper } from './styled'

export function SPDTFork({ id, data }: SPDTProps) {
  return SPDT({ id, data }, 'fork')
}

export function SPDTJoin({ id, data }: SPDTProps) {
  return SPDT({ id, data }, 'join')
}

export function SPDT({ id, data }: SPDTProps, spdtType: 'fork' | 'join') {
  const [state, setState] = useState(data.state ?? 'A')
  const inputId = `${id}-input`
  const outputAId = `${id}-outputA`
  const outputBId = `${id}-outputB`
  const inputInstance = useRef(new GainNode(audio.context))
  const outputAInstance = useRef(new GainNode(audio.context))
  const outputBInstance = useRef(new GainNode(audio.context))
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const sockets: Socket[] = [
    {
      id: inputId,
      label: '',
      type: spdtType === 'fork' ? 'target' : 'source',
      visual: 'circle',
      edge: 'left',
      offset: 32
    },
    {
      id: outputAId,
      type: spdtType === 'fork' ? 'source' : 'target',
      visual: 'circle',
      edge: 'right',
      offset: 32
    },
    {
      id: outputBId,
      type: spdtType === 'fork' ? 'source' : 'target',
      visual: 'circle',
      edge: 'right',
      offset: 48
    },
  ]

  useEffect(() => {
    if (spdtType === 'fork') {
      inputInstance.current.connect(outputAInstance.current)
      inputInstance.current.connect(outputBInstance.current)
    } else {
      outputAInstance.current.connect(inputInstance.current)
      outputBInstance.current.connect(inputInstance.current)
    }
    
    setInstance(inputId, inputInstance.current, spdtType === 'fork' ? 'target' : 'source')
    setInstance(outputAId, outputAInstance.current, spdtType === 'fork' ? 'source' : 'target')
    setInstance(outputBId, outputBInstance.current, spdtType === 'fork' ? 'source' : 'target')
  }, [])

  useEffect(() => {
    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, state }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)

    const time = audio.context.currentTime
    if (state === 'A') {
      outputAInstance.current.gain.linearRampToValueAtTime(1, time + 0.03)
      outputBInstance.current.gain.linearRampToValueAtTime(0, time + 0.03)
    } else {
      outputAInstance.current.gain.linearRampToValueAtTime(0, time + 0.03)
      outputBInstance.current.gain.linearRampToValueAtTime(1, time + 0.03)
    }
  }, [state])

  return (
    <Node 
      id={id}
      data={data}
      width={3}
      height={4}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      disableBackground
      disableBorder
    > 
      <ConnectionWrapper 
        state={state} 
        rotation={data.rotation} 
        onClick={() => setState(state === 'A' ? 'B' : 'A')}
      >
        <ConnectionLine />
      </ConnectionWrapper>
    </Node>
  )
}

