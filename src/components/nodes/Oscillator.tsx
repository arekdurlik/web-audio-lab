import { NodeProps, OscillatorProps } from './types'
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
import { LogRangeInput } from '../inputs/LogRangeInput'
import { useReactFlow } from 'reactflow'

export function Oscillator({ id, data }: OscillatorProps) {
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [frequency, setFrequency] = useState(data.frequency ?? 20)
  const [detune, setDetune] = useState(data.detune ?? 0)
  const [type, setType] = useState<OscillatorType>(data.type ?? 'sine')
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
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

  useEffect(() => {
    return () => { try { 
      instance.current.stop()
     } catch {} }
  }, [])

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

  useEffect(() => {
    if (playing) {
      try { instance.current.stop() } catch {}

      instance.current = new OscillatorNode(audio.context, {
        type,
        frequency,
        detune
      })
      setInstance(audioId, instance.current)
      setInstance(freqId, instance.current.frequency)
      setInstance(detuneId, instance.current.detune)
      instance.current.start()
    } else {
      try { instance.current.stop() } catch {}
    }
  }, [playing])

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


