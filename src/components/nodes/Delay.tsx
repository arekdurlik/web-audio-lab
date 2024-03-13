import { DelayProps } from './types'
import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { FlexContainer } from '../../styled'

export function Delay({ id, data }: DelayProps) {
  const [time, setTime] = useState(data.time ?? 0.5)
  const [min, setMin] = useState<number>(data.min ?? 0)
  const [max, setMax] = useState<number>(data.max ?? 2)
  
  const [ramp, setRamp] = useState(data.ramp ?? 0.04)
  const [rampMin, setRampMin] = useState<number>(data.rampMin ?? 0)
  const [rampMax, setRampMax] = useState<number>(data.rampMax ?? 2)
  
  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const setInstance = useNodeStore(state => state.setInstance)
  const instance = useRef(new DelayNode(audio.context, { 
    maxDelayTime: max 
  }))
  const { updateNode } = useUpdateFlowNode(id)
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
      visual: 'param',
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
    instance.current = new DelayNode(audio.context, { maxDelayTime: max })
    instance.current.delayTime.value = time
    setInstance(audioId, instance.current, 'source')
    setInstance(controlVoltageId, instance.current.delayTime, 'param')
  }, [max])

  useEffect(() => {
    if (time === undefined || Number.isNaN(time)) return

    updateNode({ time })
    instance.current.delayTime.cancelScheduledValues(audio.context.currentTime)
    instance.current.delayTime.setValueAtTime(instance.current.delayTime.value, audio.context.currentTime)
    instance.current.delayTime.linearRampToValueAtTime(time, audio.context.currentTime + ramp)
  }, [time])

  const Parameters = 
    <FlexContainer direction='column' gap={8}>
      <RangeInput
        label='Time (s):'
        value={time}
        min={min}
        max={max}
        onChange={setTime}
        numberInput
        adjustableBounds
        onMinChange={setMin}
        onMaxChange={setMax}
      />

      <RangeInput
        label='Ramp (s):'
        value={ramp}
        min={rampMin}
        max={rampMax}
        onChange={setRamp}
        numberInput
        adjustableBounds
        onMinChange={setRampMin}
        onMaxChange={setRampMax}
      />
    </FlexContainer>
    
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

