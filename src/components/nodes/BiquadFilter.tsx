import { BiquadFilterParam, BiquadFilterProps } from './types'
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
  const [frequency, setFrequency] = useState(data.frequency ?? 8000)
  const [detune, setDetune] = useState(data.detune ?? 0)
  const [Q, setQ] = useState(data.Q ?? 0)
  const [gain, setGain] = useState(data.gain ?? 0)
  const [type, setType] = useState<BiquadFilterType>(data.type ?? 'lowpass')

  const [expanded, setExpanded] = useState(data.expanded ?? {
    t: true, f: true, d: true, q: true, g: true
  })

  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  const instance = useRef(new BiquadFilterNode(audio.context, {
    frequency, detune, Q, gain, type
  }))

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

  const typeLabels = {
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
    const invalid = [frequency, detune, Q, gain].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    updateNode({ frequency, detune, Q, gain, type, expanded })
  }, [frequency, detune, Q, gain, type, expanded])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as BiquadFilterType
    setType(type)
    instance.current.type = type
  }

  function handleParam(param: BiquadFilterParam, value: number) {
    switch (param) {
      case 'frequency': setFrequency(value); break
      case 'detune': setDetune(value); break
      case 'Q': setQ(value); break
      case 'gain': setGain(value); break
    }
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
      value={type}
      onChange={handleType}
      expanded={expanded.t}
      onExpandChange={value => setExpanded(state => ({ ...state, t: value }))}
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
    />
    <Hr/>
    <RangeInput
      logarithmic
      label='Frequency (Hz):'
      value={frequency}
      max={22000}
      onChange={value => handleParam('frequency', value)}
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      expanded={expanded.f}
      onExpandChange={value => setExpanded(state => ({ ...state, f: value }))}
    />
    <Hr/>
    <RangeInput
      label='Detune (cents):'
      value={detune}
      min={-100}
      max={100}
      onChange={value => handleParam('detune', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      expanded={expanded.d}
      onExpandChange={value => setExpanded(state => ({ ...state, d: value }))}
    />
    <Hr/>
    <RangeInput
      label='Quality:'
      value={Q}
      max={100}
      onChange={value => handleParam('Q', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      disabled={['lowshelf', 'highshelf'].includes(type)}
      expanded={expanded.q}
      onExpandChange={value => setExpanded(state => ({ ...state, q: value }))}
    />
    <Hr/>
    <RangeInput
      label='Gain (dB):'
      value={gain}
      max={100}
      onChange={value => handleParam('gain', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(type)}
      expanded={expanded.g}
      onExpandChange={value => setExpanded(state => ({ ...state, g: value }))}
    />
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='BQF'
      value={typeLabels[type]}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

