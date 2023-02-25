import { DelayProps, NodeProps } from './types'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { useReactFlow } from 'reactflow'

export function Delay({ id, data }: DelayProps) {
  const [time, setTime] = useState(data.time ?? 0.5)
  const maxDelay = 5
  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const instance = useMemo(() => new DelayNode(audio.context, { 
    maxDelayTime: maxDelay 
  }), [maxDelay])
  const sockets: Socket[] = [
    {
      id: audioId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: 24
    },
    {
      id: controlVoltageId,
      label: 't',
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 48
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  useEffect(() => {
    instance.delayTime.value = time
    setInstance(audioId, instance)
    setInstance(controlVoltageId, instance.delayTime)
  }, [])

  useEffect(() => {
    if (time === undefined || Number.isNaN(time)) return

    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, time }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)

    instance.delayTime.setValueAtTime(instance.delayTime.value, audio.context.currentTime)
    instance.delayTime.linearRampToValueAtTime(time, audio.context.currentTime + 0.04)
  }, [time])

  const Parameters = <>
    Time:
    <Parameter>
      <RangeInput
        max={maxDelay}
        onChange={setTime} 
        defaultValue={time}
        value={time}
      />
      <NumberInput 
        max={maxDelay}
        onChange={setTime} 
        value={time}
      />
    </Parameter>
  </>

  return (
    <Node 
      id={id}
      name='Delay'
      value={time}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

