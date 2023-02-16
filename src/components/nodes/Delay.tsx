import { NodeProps } from './types'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Parameter } from './Node/styled'
import { Node } from './Node'
import { Socket } from './Node/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'

export function Delay({ id, data }: NodeProps) {
  const [time, setTime] = useState(0.5)
  const maxDelay = 5
  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const setInstance = useNodeStore(state => state.setInstance)
  const instance = useMemo(() => new DelayNode(audio.context, { 
    maxDelayTime: maxDelay 
  }), [maxDelay])
  const sockets: Socket[] = [
    {
      id: audioId,
      label: 'in',
      type: 'target',
      edge: 'left',
      offset: 40
    },
    {
      id: controlVoltageId,
      label: 'cv',
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 50
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 20
    }
  ]

  useEffect(() => {
    instance.delayTime.value = time
    setInstance(audioId, instance)
    setInstance(controlVoltageId, instance.delayTime)
  }, [])

  useEffect(() => {
    if (!time || Number.isNaN(time)) return

    instance.delayTime.setValueAtTime(instance.delayTime.value, audio.context.currentTime)
    instance.delayTime.linearRampToValueAtTime(time, audio.context.currentTime + 0.04)
  }, [time])

  function handleTime(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    setTime(value)
  }

  const Parameters = <>
    Time:
    <Parameter>
      <RangeInput
        max={maxDelay}
        onChange={handleTime} 
        defaultValue={time}
        value={time}
      />
      <NumberInput 
        max={maxDelay}
        onChange={handleTime} 
        value={time}
      />
    </Parameter>
  </>

  return (
    <Node 
      id={id}
      name='Delay'
      data={data}
      width={100}
      height={60}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

