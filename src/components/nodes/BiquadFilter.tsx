import { NodeProps } from './types'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { FlexContainer } from '../../styled'
import { Select } from '../inputs/styled'
import styled from 'styled-components'
import { LogRangeInput } from '../inputs/LogRangeInput'

export function BiquadFilter({ id, data }: NodeProps) {
  const [frequency, setFrequency] = useState(8000)
  const [detune, setDetune] = useState(0)
  const [Q, setQ] = useState(0)
  const [gain, setGain] = useState(1)
  const [type, setType] = useState<BiquadFilterType>('lowpass')
  const setInstance = useNodeStore(state => state.setInstance)
  const instance = useMemo(() => new BiquadFilterNode(audio.context), [id])

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
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 32
    },
    {
      id: detuneId,
      label: 'd',
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 64
    },
    {
      id: QId,
      label: 'Q',
      visual: 'triangle',
      type: 'target',
      edge: 'bottom',
      offset: 64
    },
    {
      id: gainId,
      label: 'g',
      visual: 'triangle',
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
    setInstance(audioId, instance)
    setInstance(freqId, instance.frequency)
    setInstance(detuneId, instance.detune)
    setInstance(QId, instance.Q)
    setInstance(gainId, instance.gain)
  }, [])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as BiquadFilterType
    setType(type)
    instance.type = type
  }

  function handleLogFrequency(newValues: { position: number, value: number }) {
    setFrequency(newValues.value)
    setInstanceParam('frequency', newValues.value)
  }

  function handleParam(param: Param, event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    switch (param) {
      case 'frequency': setFrequency(value); break
      case 'detune': setDetune(value); break
      case 'Q': setQ(value); break
      case 'gain': setGain(value); break
    }
    setInstanceParam(param, value)
  }

  type Param = 'frequency' | 'detune' | 'Q' | 'gain'
  function setInstanceParam(param: Param, value: any) {
    if (value === undefined || Number.isNaN(value)) return

    instance[param].setValueAtTime(instance[param].value, audio.context.currentTime)
    instance[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04)
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
          onChange={handleLogFrequency} 
          value={frequency}
          />
        <NumberInput 
          max={22000}
          onChange={(e) => handleParam('frequency', e)} 
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
          onChange={(e) => handleParam('detune', e)} 
          value={detune}
          />
        <NumberInput 
          min={-100}
          max={100}
          onChange={(e) => handleParam('detune', e)} 
          value={detune}
          unit='cents'
        />
      </Parameter>
    </div>
    <div>
      Q:
      <Parameter>
        <RangeInput
          disabled={['lowshelf', 'highshelf'].includes(type)}
          onChange={(e) => handleParam('Q', e)} 
          value={Q}
          />
        <NumberInput 
          disabled={['lowshelf', 'highshelf'].includes(type)}
          onChange={(e) => handleParam('Q', e)} 
          value={Q}
        />
      </Parameter>
    </div>
    <div>
      Gain:
      <Parameter>
        <RangeInput
          disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(type)}
          onChange={(e) => handleParam('gain', e)} 
          value={gain}
          />
        <NumberInput 
          disabled={['lowpass', 'highpass', 'bandpass', 'notch', 'allpass'].includes(type)}
          onChange={(e) => handleParam('gain', e)} 
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

const Icon = styled.img`
width: 16px;
height: 16px;
position: relative;
left: -4px;
bottom: 1px;
image-rendering: pixelated;
`

