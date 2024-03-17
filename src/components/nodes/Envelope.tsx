import { EnvelopeParams, EnvelopeProps, GainParams, GainProps } from './types'
import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { Hr } from './BaseNode/styled'

export function Envelope({ id, data }: EnvelopeProps) {
  // ADSR
  const [params, setParams] = useState<EnvelopeParams>({
    ...{ a: 1, aMin: 0, aMax: 2, d: 1, dMin: 0, dMax: 2, s: 1, sMin: 0, sMax: 2, r: 1, rMin: 0, rMax: 2, expanded: { a: true, d: true, s: true, r: true }},
    ...data.params
  })
  const attackRef = useRef(params.a)
  const decayRef = useRef(params.d)
  const sustainRef = useRef(params.s)
  const releaseRef = useRef(params.r)
  const [constant] = useState(new ConstantSourceNode(audio.context, { offset: 1 }))
  const [gate] = useState(new AudioWorkletNode(audio.context, 'gate-processor', {
    parameterData: { threshold : 1 }
  })) 
  
  const [input] = useState(new GainNode(audio.context, { gain: 1 }))
  const [envelope] = useState(new GainNode(audio.context, { gain: 0 }))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  
  const inputId = `${id}-input`
  const outputId = `${id}-output`
  const sockets: Socket[] = [
    {
      id: inputId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: 24
    },
    {
      id: outputId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]
  
  useEffect(() => {
    setInstance(inputId, input, 'target')
    setInstance(outputId, envelope, 'source')

    input.connect(gate)
    constant.connect(envelope)
    try { constant.start() } catch {}
  }, [])
  
  useEffect(() => {
    updateNode({ params })
  }, [params])
  
  gate.port.onmessage = function({ data: up }) {
    if (up) {
      startEnvelope()
    } else {
      stopEnvelope()
    }
  }

  function startEnvelope() {
    envelope.gain.cancelScheduledValues(audio.context.currentTime)
    envelope.gain.setValueAtTime(envelope.gain.value, audio.context.currentTime)

    const atkDuration = attackRef.current
    const atkEndTime = audio.context.currentTime + atkDuration
    const decayDuration = decayRef.current
    const sustainValue = sustainRef.current

    envelope.gain.linearRampToValueAtTime(1, atkEndTime)
    envelope.gain.setTargetAtTime(sustainValue, atkEndTime, decayDuration)
  }

  function stopEnvelope() {
    const releaseDuration = releaseRef.current

    envelope.gain.cancelScheduledValues(audio.context.currentTime)
    envelope.gain.setValueAtTime(envelope.gain.value, audio.context.currentTime)
    envelope.gain.linearRampToValueAtTime(0, audio.context.currentTime + releaseDuration)
  }
  const Parameters = 
  <FlexContainer direction='column'>
      <RangeInput
        label='Attack (s):'
        value={params.a}
        min={params.aMin}
        max={params.aMax}
        step={0.001}
        onChange={v => { setParams(state => ({ ...state, a: v })); attackRef.current = v }}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, aMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, aMax: v }))}
        expanded={params.expanded.a}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, a: v }}))}
        />
      <Hr/>
      <RangeInput
        label='Decay (s):'
        value={params.d}
        min={params.dMin}
        max={params.dMax}
        step={0.001}
        onChange={v => { setParams(state => ({ ...state, d: v })); decayRef.current = v }}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, dMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, dMax: v }))}
        expanded={params.expanded.d}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, d: v }}))}
        />
      <Hr/>
      <RangeInput
        label='Sustain:'
        value={params.s}
        min={params.sMin}
        max={params.sMax}
        step={0.001}
        onChange={v => { setParams(state => ({ ...state, s: v })); sustainRef.current = v }}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, sMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, sMax: v }))}
        expanded={params.expanded.s}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, s: v }}))}
        />
      <Hr/>
      <RangeInput
        label='Release (s):'
        value={params.r}
        min={params.rMin}
        max={params.rMax}
        step={0.001}
        onChange={v => { setParams(state => ({ ...state, r: v })); releaseRef.current = v }}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, rMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, rMax: v }))}
        expanded={params.expanded.r}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, r: v }}))}
        />
      <Hr/>
    </FlexContainer>

  return (
    <Node 
      id={id}
      name='Envelope'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}