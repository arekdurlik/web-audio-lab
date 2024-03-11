import { BiquadFilterParam, BiquadFilterProps, NodeProps } from './types'
import { useRef, ChangeEvent, useEffect, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { FlexContainer } from '../../styled'
import { Select } from '../inputs/styled'
import { LogRangeInput } from '../inputs/LogRangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

export function BiquadFilter({ id, data }: BiquadFilterProps) {
  const [frequency, setFrequency] = useState(data.frequency ?? 8000)
  const [detune, setDetune] = useState(data.detune ?? 0)
  const [Q, setQ] = useState(data.Q ?? 0)
  const [gain, setGain] = useState(data.gain ?? 0)
  const [type, setType] = useState<BiquadFilterType>(data.type ?? 'lowpass')
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

    updateNode({ frequency, detune, Q, gain, type })
  }, [frequency, detune, Q, gain, type])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as BiquadFilterType
    setType(type)
    instance.current.type = type
  }

  function handleLogParam(param: 'frequency' | 'Q', newValues: { position: number, value: number }) {
    param === 'Q' ? setQ(newValues.value) : setFrequency(newValues.value)
    setInstanceParam(param, newValues.value)
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

  const Parameters = <FlexContainer direction='column' gap={8}>
    <div>
      Type:
      <Parameter>
        <Select onChange={handleType} value={type}>
          <option value='lowpass'>Low pass</option>
          <option value='highpass'>High pass</option>
          <option value='allpass'>All pass</option>
          <option value='bandpass'>Band pass</option>
          <option value='lowshelf'>Low shelf</option>
          <option value='highshelf'>High shelf</option>
          <option value='peaking'>Peaking</option>
          <option value='notch'>Notch</option>
        </Select>
      </Parameter>
    </div>
    <div>
      Frequency:
      <Parameter>
        <LogRangeInput
          maxval={22000}
          onChange={(newValues) => handleLogParam('frequency', newValues)} 
          value={frequency}
          />
        <NumberInput 
          max={22000}
          onChange={value => handleParam('frequency', value)} 
          unit='Hz'
          width={72}
          value={frequency}
        />
      </Parameter>
    </div>
    <div>
      Detune:
      <Parameter>
        <RangeInput
          min={-100}
          max={100}
          onChange={value => handleParam('detune', value)} 
          value={detune}
          />
        <NumberInput 
          min={-100}
          max={100}
          onChange={value => handleParam('detune', value)} 
          value={detune}
          unit='cents'
        />
      </Parameter>
    </div>
    <div>
      Q:
      <Parameter>
        <LogRangeInput
          disabled={['lowshelf', 'highshelf'].includes(type)}
          maxval={1000}
          onChange={(newValues) => handleLogParam('Q', newValues)} 
          value={Q}
        />
        <NumberInput 
          disabled={['lowshelf', 'highshelf'].includes(type)}
          onChange={value => handleParam('Q', value)} 
          value={Q}
        />
      </Parameter>
    </div>
    <div>
      Gain:
      <Parameter>
        <RangeInput
          disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(type)}
          onChange={value => handleParam('gain', value)} 
          value={gain}
          />
        <NumberInput 
          disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(type)}
          onChange={value => handleParam('gain', value)} 
          value={gain}
          min={-40}
          max={40}
          unit='dB'
        />
      </Parameter>
    </div>
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

