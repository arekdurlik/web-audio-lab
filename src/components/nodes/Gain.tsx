import { GainParams, GainProps } from './types'
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
  const [params, setParams] = useState<GainParams>({
    ...{ gain: 1, min: 0, max: 2, ramp: 0.04, rampMin: 0, rampMax: 2, expanded: { g: true, r: false }},
    ...data.params
  })

  const [instance] = useState(new GainNode(audio.context, { gain: params.gain }))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)

  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
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
    setInstance(audioId, instance, 'source')
    setInstance(controlVoltageId, instance.gain, 'param')
  }, [])

  useEffect(() => {
    updateNode({ params })
  }, [params])

  useEffect(() => {
    if (params.gain === undefined || Number.isNaN(params.gain)) return
    instance.gain.cancelScheduledValues(audio.context.currentTime)
    instance.gain.setValueAtTime(instance.gain.value, audio.context.currentTime)
    instance.gain.linearRampToValueAtTime(params.gain, audio.context.currentTime + params.ramp)
  }, [params.gain])

  const Parameters = 
    <FlexContainer direction='column'>
      <RangeInput
        label='Gain (dB):'
        value={params.gain}
        min={params.min}
        max={params.max}
        step={0.001}
        onChange={v => setParams(state => ({ ...state, gain: v }))}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, min: v }))}
        onMaxChange={v => setParams(state => ({ ...state, max: v }))}
        expanded={params.expanded.g}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, g: v }}))}
      />
      <Hr/>
      <RangeInput
        label='Ramp (s):'
        value={params.ramp}
        min={params.rampMin}
        max={params.rampMax}
        onChange={ramp => setParams(state => ({ ...state, ramp }))}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, rampMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, rampMax: v }))}
        expanded={params.expanded.r}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, r: v }}))}
      />
    </FlexContainer>

  return (
    <Node 
      id={id}
      name='Gain'
      value={params.gain}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}