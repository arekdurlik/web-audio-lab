import { NodeProps, OscillatorProps } from './types'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Parameter, ParameterName } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { FlexContainer } from '../../styled'
import { Select } from '../inputs/styled'
import { LogRangeInput } from '../inputs/LogRangeInput'
import { useReactFlow } from 'reactflow'
import styled from 'styled-components'

export function Oscillator({ id, data }: OscillatorProps) {
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [frequency, setFrequency] = useState(data.frequency ?? 20)
  const [detune, setDetune] = useState(data.detune ?? 0)
  const [type, setType] = useState<OscillatorType>(data.type ?? 'sine')
  const [customLength, setCustomLength] = useState(2)
  const [real, setReal] = useState<number[]>(data.real ?? [0, 1])
  const [imag, setImag] = useState<number[]>(data.imag ?? [0, 0])
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const instance = useRef<OscillatorNode | null>()

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

  const typeLabels = {
    sine: 'sin',
    square: 'sq',
    sawtooth: 'saw',
    triangle: 'tri',
    custom: 'wt'
  }

  // cleanup
  useEffect(() => {
    return () => { 
      try { instance.current?.stop() } catch {} 
    }
  }, [])

  // update reactflow whenever a value changes
  useEffect(() => {
    const invalid = [frequency, detune].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, playing, frequency, detune, type }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)
  }, [playing, frequency, detune, type])

  // start or stop oscillator
  useEffect(() => {
    if (playing) {
      try { instance.current?.stop() } catch {}

      instance.current = new OscillatorNode(audio.context, {
        type,
        frequency,
        detune,
        ...(type === 'custom') && { periodicWave: audio.context.createPeriodicWave(real, imag) }
      })
      setInstance(audioId, instance.current)
      setInstance(freqId, instance.current.frequency)
      setInstance(detuneId, instance.current.detune)
      instance.current.start()
    } else {
      try { instance.current?.stop() } catch {}
    }
  }, [playing])

  // update real and imag arrays if length input changes
  useEffect(() => {
    if (customLength > real.length) {
      setReal(state => [...state, 0])
      setImag(state => [...state, 0])
    } else {
      setReal(state => {
        const newState = [...state]
        newState.pop()
        return newState
      })
      setImag(state => {
        const newState = [...state]
        newState.pop()
        return newState
      })
    }
  }, [customLength])
  
  // if type is set to custom, set the periodic wave whenever the wavetable changes
  useEffect(() => {
    if (type !== 'custom' || !instance.current) return

    const realNan = real.find(v => v === undefined || Number.isNaN(v))
    const imagNan = imag.find(v => v === undefined || Number.isNaN(v))

    if (realNan !== undefined || imagNan !== undefined) return

    instance.current.setPeriodicWave(audio.context.createPeriodicWave(real, imag))
  }, [real, imag])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as OscillatorType
    setType(type)

    if (!instance.current) return

    if (type === 'custom') {
      instance.current.setPeriodicWave(audio.context.createPeriodicWave(real, imag))
    } else {
      instance.current.type = type
    }
  }

  function handleLogFrequency(newValues: { position: number, value: number }) {
    setFrequency(newValues.value)
    setParam('frequency', newValues.value)
  }

  function handleParam(param: Param, value: number) {
    switch(param) {
      case 'frequency': setFrequency(value); break
      case 'detune': setDetune(value); break
    }
    setParam(param, value)
  }

  type Param = 'frequency' | 'detune'
  function setParam(param: Param, value: any) {
    if (!instance.current || value === undefined || Number.isNaN(value)) return

    instance.current[param].setValueAtTime(instance.current[param].value, audio.context.currentTime)
    instance.current[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04)
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <FlexContainer gap={8}>
      <button onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}>{playing ? 'Stop' : 'Start'}</button>
    </FlexContainer>
    <div>
      Type:
      <Parameter>
        <Select onChange={handleType} value={type}>
          <option value='sine'>Sine</option>
          <option value='square'>Square</option>
          <option value='sawtooth'>Sawtooth</option>
          <option value='triangle'>Triangle</option>
          <option value='custom'>Custom</option>
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
          min={-1200}
          max={1200}
          step={0.1}
          onChange={value => handleParam('detune', value)} 
          value={detune}
          />
        <NumberInput 
          min={-1200}
          max={1200}
          unit='cents'
          onChange={value => handleParam('detune', value)} 
          value={detune}
        />
      </Parameter>
    </div>
    {type === 'custom' ? <div>
      <ParameterName>Length:</ParameterName>
      <Parameter>
        <NumberInput 
          min={2}
          step={1}
          onChange={setCustomLength} 
          value={customLength}
        />
      </Parameter>
      <ParameterName>Real:</ParameterName>
      <WaveTable>
        {Array(customLength).fill(0).map((_, i) => 
          <NumberInput 
            key={i}
            min={-1} 
            max={1} 
            step={0.001} 
            value={real[i]}
            onChange={newValue => setReal(state => {
              const newState = [...state]
              newState[i] = newValue
              return newState
            })}
          />)}
      </WaveTable>
      <ParameterName>Imaginary:</ParameterName>
      <WaveTable>
        {Array(customLength).fill(0).map((_, i) => 
          <NumberInput 
            key={i}
            min={-1} 
            max={1} 
            step={0.001} 
            value={imag[i]}
            onChange={newValue => setImag(state => {
              const newState = [...state]
              newState[i] = newValue
              return newState
            })}
          />)}
      </WaveTable>
    </div> : ''}
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Oscillator'
      data={data}
      value={typeLabels[type]}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

const WaveTable = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 59px);
  & > * {
    margin-bottom: -1px;
  }

  input { 
    max-width: 54px;
  }

`


