import { NodeProps } from './types'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
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

export function Oscillator({ id, data }: NodeProps) {
  const [playing, setPlaying] = useState(false)
  const [frequency, setFrequency] = useState(300)
  const [detune, setDetune] = useState(0)
  const [type, setType] = useState<OscillatorType>('sine')
  const setInstance = useNodeStore(state => state.setInstance)
  const instance = useRef(new OscillatorNode(audio.context, { type: 'sine' }))

  const audioId = `${id}-audio`
  const freqId = `${id}-freq`
  const detuneId = `${id}-detune`
  const sockets: Socket[] = [
    {
      id: freqId,
      label: 'f',
      visual: 'triangle',
      type: 'target',
      edge: 'bottom',
      offset: 48
    },
    {
      id: detuneId,
      label: 'd',
      visual: 'triangle',
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

  function handleStart() {
    try { instance.current.stop() } catch {}
    instance.current = new OscillatorNode(audio.context, {
      type,
      frequency,
      detune
    })

    setInstance(audioId, instance.current)
    setInstance(freqId, instance.current.frequency)
    setInstance(detuneId, instance.current.detune)
    setPlaying(true)
    instance.current.start()
  }

  function handleStop() {
    try { instance.current.stop() } catch {}
    setPlaying(false)
  }

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as OscillatorType
    setType(type)
    instance.current.type = type
  }

  function handleLogFrequency(newValues: { position: number, value: number }) {
    setFrequency(newValues.value)
    setParam('frequency', newValues.value)
  }

  function handleFrequency(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    setFrequency(value)
    setParam('frequency', value)
  }

  function handleDetune(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    setDetune(value)
    setParam('detune', value)
  }


  type Param = 'frequency' | 'detune'
  function setParam(param: Param, value: any) {
    if (value === undefined || Number.isNaN(value)) return

    instance.current[param].setValueAtTime(instance.current[param].value, audio.context.currentTime)
    instance.current[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04)
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <FlexContainer gap={8}>
      <button onClick={playing ? handleStop : handleStart}>{playing ? 'Stop' : 'Start'}</button>
    </FlexContainer>
    <div>
      Type:
      <Parameter>
        <Select onChange={handleType}>
          <option value='sine'>Sine</option>
          <option value='square'>Square</option>
          <option value='sawtooth'>Sawtooth</option>
          <option value='triangle'>Triangle</option>
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
          onChange={handleFrequency} 
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
          min={-1200}
          max={1200}
          step={0.1}
          onChange={handleDetune} 
          value={detune}
          />
        <NumberInput 
          min={-1200}
          max={1200}
          unit='cents'
          onChange={handleDetune} 
          value={detune}
        />
      </Parameter>
    </div>
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Oscillator'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}


