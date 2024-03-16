import { GainProps } from './types'
import { useEffect, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { Hr } from './BaseNode/styled'

export function Gain({ id, data }: GainProps) {
  const [gain, setGain] = useState(data.gain ?? 1)
  const [min, setMin] = useState(data.min ?? 0)
  const [max, setMax] = useState(data.max ?? 2)

  const [ramp, setRamp] = useState(data.ramp ?? 0.04)
  const [rampMin, setRampMin] = useState(data.rampMin ?? 0)
  const [rampMax, setRampMax] = useState(data.rampMax ?? 2)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    g: true, r: false
  })

  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const [instance] = useState(new GainNode(audio.context))
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
      id: controlVoltageId,
      label: 'g',
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
    instance.gain.value = gain
    setInstance(audioId, instance, 'source')
    setInstance(controlVoltageId, instance.gain, 'param')
  }, [])

  useEffect(() => {
    const invalid = [gain, min, max].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })
    if (invalid) return

    updateNode({ gain, min, max, expanded })
  }, [gain, max, min, expanded])

  useEffect(() => {
    if (gain === undefined || Number.isNaN(gain)) return
    instance.gain.cancelScheduledValues(audio.context.currentTime)
    instance.gain.setValueAtTime(instance.gain.value, audio.context.currentTime)
    instance.gain.linearRampToValueAtTime(gain, audio.context.currentTime + ramp)
  }, [gain])

  const Parameters = 
    <FlexContainer direction='column'>
      <RangeInput
        label='Gain (dB):'
        value={gain}
        min={min}
        max={max}
        step={0.001}
        onChange={setGain}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={setMin}
        onMaxChange={setMax}
        expanded={expanded.g}
        onExpandChange={value => setExpanded(state => ({ ...state, g: value }))}
      />
      <Hr/>
      <RangeInput
        label='Ramp (s):'
        value={ramp}
        min={rampMin}
        max={rampMax}
        onChange={setRamp}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={setRampMin}
        onMaxChange={setRampMax}
        expanded={expanded.r}
        onExpandChange={value => setExpanded(state => ({ ...state, r: value }))}
      />
    </FlexContainer>

  return (
    <Node 
      id={id}
      name='Gain'
      value={gain}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}