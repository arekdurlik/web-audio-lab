import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { GateProps, GateParams } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { Hr } from './BaseNode/styled'

export function Gate({ id, data }: GateProps) {
  const [params, setParams] = useState<GateParams>({
    ...{ threshold: 0.5, min: 0, max: 1, ramp: 0.04, rampMin: 0, rampMax: 2, expanded: { t: true } },
    ...data.params
  })
  const instance = useRef(new AudioWorkletNode(audio.context, 'gate-processor', {
    parameterData: { threshold: params.threshold }
  }))

  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)

  const audioId = `${id}-audio`
  const sockets: Socket[] = [
    {
      id: audioId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: 24
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  useEffect(() => {
    setInstance(audioId, instance.current, 'source')
    instance.current.port.onmessage = function({ data }) {
      console.log(data)
    }
    instance.current.onprocessorerror = function(e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    updateNode({ params })
  }, [params])

  function handleThreshold(value: number) {
    setParams(state => ({ ...state, threshold: value }))
    
    instance.current.port.postMessage({ paramChange: value })
    
    // TODO: figure out why parameters.threshold[0] value is stale
    const threshold = instance.current.parameters.get('threshold')
    threshold?.cancelScheduledValues(audio.context.currentTime)
    threshold?.setValueAtTime(threshold.value, audio.context.currentTime)
    threshold?.linearRampToValueAtTime(params.threshold, audio.context.currentTime + params.ramp)
  }

  const Parameters = 
    <FlexContainer direction='column'>
      <RangeInput
        label='Threshold:'
        value={params.threshold}
        min={params.min}
        max={params.max}
        step={0.001}
        onChange={handleThreshold}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, min: v }))}
        onMaxChange={v => setParams(state => ({ ...state, max: v }))}
        expanded={params.expanded.t}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, t: v }}))}
      />
      {/* <Hr/>
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
      /> */}
    </FlexContainer>

  return (
    <Node 
      id={id}
      name='Gate'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}