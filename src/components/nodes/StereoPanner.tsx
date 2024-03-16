import { StereoPannerProps } from './types'
import { useEffect, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { FlexContainer } from '../../styled'
import { Hr } from './BaseNode/styled'

export function StereoPanner({ id, data }: StereoPannerProps) {
  const [pan, setPan] = useState(data.pan ?? 0)
  const [min, setMin] = useState(data.min ?? -1)
  const [max, setMax] = useState(data.max ?? 1)

  const [ramp, setRamp] = useState(data.ramp ?? 0.04)
  const [rampMin, setRampMin] = useState(data.rampMin ?? 0)
  const [rampMax, setRampMax] = useState(data.rampMax ?? 2)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    p: true, r: false
  })

  const audioId = `${id}-audio`
  const panId = `${id}-pan`
  const [instance] = useState(new StereoPannerNode(audio.context))
  const setInstance = useNodeStore(state => state.setInstance)
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
      id: panId,
      label: 'p',
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
    instance.pan.value = pan
    setInstance(audioId, instance, 'source')
    setInstance(panId, instance.pan, 'param')
  }, [])

  useEffect(() => {
    if (pan === undefined || Number.isNaN(pan)) return
    
    updateNode(pan)
    instance.pan.setValueAtTime(instance.pan.value, audio.context.currentTime)
    instance.pan.linearRampToValueAtTime(pan, audio.context.currentTime + 0.03)
  }, [pan])

  const Parameters = <FlexContainer direction='column'>
    <RangeInput
      label='Pan:'
      value={pan}
      min={min}
      max={max}
      onChange={setPan}
      onMinChange={setMin}
      onMaxChange={setMax}
      numberInput
      adjustableBounds
      expanded={expanded.p}
      onExpandChange={value => setExpanded(state => ({ ...state, p: value }))}
    />
    <Hr/>
    <RangeInput
      label='Ramp (s):'
      value={ramp}
      min={rampMin}
      max={rampMax}
      onChange={setRamp}
      onMinChange={setRampMin}
      onMaxChange={setRampMax}
      numberInput
      adjustableBounds
      expanded={expanded.r}
      onExpandChange={value => setExpanded(state => ({ ...state, r: value }))}
    />
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Stereo panner'
      value={pan}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}