import { BiquadFilterParam, BiquadFilterParams, BiquadFilterProps } from './types'
import { useRef, ChangeEvent, useEffect, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { FlexContainer } from '../../styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { SelectInput } from '../inputs/SelectInput'
import { Hr } from './BaseNode/styled'

const NUMBER_INPUT_WIDTH = 52

export function BiquadFilter({ id, data }: BiquadFilterProps) {
  const [params, setParams] = useState<BiquadFilterParams>({
    ...{ type: 'lowpass', frequency: 8000, detune: 0, Q: 0, gain: 0, expanded: { t: true, f: true, d: true, q: true, g: true }},
    ...data.params
  })
  
  const instance = useRef(new BiquadFilterNode(audio.context, {
    frequency: params.frequency, detune: params.detune, Q: params.Q, gain: params.gain, type: params.type
  }))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  
  const audioId = `${id}-audio`
  const freqId = `${id}-freq`
  const QId = `${id}-q`
  const detuneId = `${id}-detune`
  const gainId = `${id}-gain`
  const sockets: Socket[] = [
    {
      id: audioId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: 24
    },
    {
      id: freqId,
      label: 'f',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 32
    },
    {
      id: detuneId,
      label: 'd',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 64
    },
    {
      id: QId,
      label: 'Q',
      visual: 'param',
      type: 'target',
      edge: 'bottom',
      offset: 64
    },
    {
      id: gainId,
      label: 'g',
      visual: 'param',
      type: 'target',
      edge: 'bottom',
      offset: 32
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  const typeLabels: { [x:string]: string } = {
    lowpass: 'lp',
    highpass: 'hp',
    allpass: 'ap',
    bandpass: 'bp',
    lowshelf: 'ls',
    highshelf: 'hs',
    peaking: 'p',
    notch: 'n'
  }

  useEffect(() => {
    setInstance(audioId, instance.current, 'source')
    setInstance(freqId, instance.current.frequency, 'param')
    setInstance(detuneId, instance.current.detune, 'param')
    setInstance(QId, instance.current.Q, 'param')
    setInstance(gainId, instance.current.gain, 'param')
  }, [])

  useEffect(() => {
    updateNode({ params })
  }, [params])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as BiquadFilterType
    setParams(state => ({ ...state, type }))
    instance.current.type = type
  }

  function handleParam(param: BiquadFilterParam, value: number) {
    setParams(state => ({ ...state, [param]: value }))
    setInstanceParam(param, value)
  }

  function setInstanceParam(param: BiquadFilterParam, value: any) {
    if (value === undefined || Number.isNaN(value)) return

    instance.current[param].setValueAtTime(instance.current[param].value, audio.context.currentTime)
    instance.current[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04)
  }

  const Parameters = <FlexContainer direction='column'>
    <SelectInput
      label='Type:'
      value={params.type}
      onChange={handleType}
      options={[
        { value: 'lowpass', label: 'Low-pass' },
        { value: 'highpass', label: 'High-pass' },
        { value: 'allpass', label: 'All-pass' },
        { value: 'bandpass', label: 'Band-pass' },
        { value: 'lowshelf', label: 'Low Shelf' },
        { value: 'highshelf', label: 'High Shelf' },
        { value: 'peaking', label: 'Peaking' },
        { value: 'notch', label: 'Notch' },
      ]}
      expanded={params.expanded.t}
      onExpandChange={t => setParams(state => ({ ...state, expanded: { ...state.expanded, t } }))}
    />
    <Hr/>
    <RangeInput
      logarithmic
      label='Frequency (Hz):'
      value={params.frequency}
      max={22000}
      onChange={value => handleParam('frequency', value)}
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      expanded={params.expanded.f}
      onExpandChange={f => setParams(state => ({ ...state, expanded: { ...state.expanded, f } }))}
    />
    <Hr/>
    <RangeInput
      label='Detune (cents):'
      value={params.detune}
      min={-100}
      max={100}
      onChange={value => handleParam('detune', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      expanded={params.expanded.d}
      onExpandChange={d => setParams(state => ({ ...state, expanded: { ...state.expanded, d } }))}
    />
    <Hr/>
    <RangeInput
      label='Quality:'
      value={params.Q}
      max={100}
      onChange={value => handleParam('Q', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      disabled={['lowshelf', 'highshelf'].includes(params.type)}
      expanded={params.expanded.q}
      onExpandChange={q => setParams(state => ({ ...state, expanded: { ...state.expanded, q } }))}
    />
    <Hr/>
    <RangeInput
      label='Gain (dB):'
      value={params.gain}
      max={100}
      onChange={value => handleParam('gain', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(params.type)}
      expanded={params.expanded.g}
      onExpandChange={g => setParams(state => ({ ...state, expanded: { ...state.expanded, g } }))}
    />
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='BQF'
      value={typeLabels[params.type]}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

