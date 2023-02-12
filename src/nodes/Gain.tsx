import { Connection, Edge, Handle, Position, useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { NumberInput } from '../NumberInput'
import { NodeProps } from './types'
import { NodeContainer, NodeTitle } from './styled'
import { ChangeEvent, useEffect, useState } from 'react'
import { useNodeStore } from '../nodeStore'
import { audio } from '../main'
import { positions } from './utils'

export function Gain(props: NodeProps) {
  const defaultValue = 1
  const [instance] = useState(new GainNode(audio.context))
  const reactFlowInstance = useReactFlow()
  const setInstance = useNodeStore(state => state.setInstance)
  const updateNodeInternals = useUpdateNodeInternals()
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setInstance(props.id, instance)
  }, [])

  function handleDelete() {
    reactFlowInstance.deleteElements({ nodes: [{ id: props.id }]})
  }

  function handleRotate() {
    setRotation(state => (state + 1) % 4)
    updateNodeInternals(props.id)
  }

  function handleGain(event: ChangeEvent<HTMLInputElement>) {
    instance.gain.setValueAtTime(instance.gain.value, audio.context.currentTime)
    instance.gain.linearRampToValueAtTime(parseFloat(event.target.value), audio.context.currentTime + 0.03)
  }

  return (
    <NodeContainer>
      <Handle
        type="target"
        position={positions[rotation][0]}
      />
      <NodeTitle>Gain</NodeTitle><span onClick={handleRotate}>rot</span><span onClick={handleDelete}>X</span>
      <NumberInput 
        label='gain' 
        min={0}
        max={1}
        onChange={handleGain} 
        defaultValue={defaultValue}
      />
      <Handle
        type="source"
        position={positions[rotation][1]}
      />
    </NodeContainer>
  )
}

