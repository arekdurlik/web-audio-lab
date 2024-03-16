import { OscillatorParams, OscillatorProps } from './types'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Hr } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { FlexContainer } from '../../styled'
import styled from 'styled-components'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { SelectInput } from '../inputs/SelectInput'
import { PlayButton } from './styled'
import { clamp } from '../../helpers'

const NUMBER_INPUT_WIDTH = 52

export function Oscillator({ id, data }: OscillatorProps) {
  const [params, setParams] = useState<OscillatorParams>({
    ...{ playing: false, frequency: 20, detune: 0, type: 'sine', customLength: 2, real: [0, 1], imag: [0, 0], expanded: { t: true, f: true, d: true }},
    ...data.params
  })
  
  const setInstance = useNodeStore(state => state.setInstance)
  const instance = useRef<OscillatorNode | null>()
  const { updateNode } = useUpdateFlowNode(id)

  const audioId = `${id}-audio`
  const freqId = `${id}-freq`
  const detuneId = `${id}-detune`
  const sockets: Socket[] = [
    {
      id: freqId,
      label: 'f',
      visual: 'param',
      type: 'target',
      edge: 'bottom',
      offset: 48
    },
    {
      id: detuneId,
      label: 'd',
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

  const typeLabels: { [x:string]: string } = {
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
    updateNode({ params })
  }, [params])

  // start or stop oscillator
  useEffect(() => {
    if (params.playing) {
      try { instance.current?.stop() } catch {}

      instance.current = new OscillatorNode(audio.context, {
        type: params.type,
        frequency: params.frequency,
        detune: params.detune,
        ...(params.type === 'custom') && { periodicWave: audio.context.createPeriodicWave(params.real, params.imag) }
      })
      setInstance(audioId, instance.current, 'source')
      setInstance(freqId, instance.current.frequency, 'param')
      setInstance(detuneId, instance.current.detune, 'param')
      instance.current.start()
    } else {
      try { instance.current?.stop() } catch {}
    }
  }, [params.playing])

  // update real and imag arrays if custom length changes
  useEffect(() => {
    if (params.customLength > params.real.length) {
      setParams(state => ({ ...state, real: [...state.real, 0] }))
      setParams(state => ({ ...state, imag: [...state.imag, 0] }))
    } else if (params.customLength < params.real.length) {
      setParams(state => {
        const newState = {...state}
        newState.real.pop()
        newState.imag.pop()
        return newState
      })
    }
  }, [params.customLength])

  // if type is set to custom, set the periodic wave whenever the wavetable changes
  useEffect(() => {
    if (params.type !== 'custom' || !instance.current) return

    const realNan = params.real.find((v: number) => v === undefined || Number.isNaN(v))
    const imagNan = params.imag.find((v: number) => v === undefined || Number.isNaN(v))

    if (realNan !== undefined || imagNan !== undefined) return

    instance.current.setPeriodicWave(audio.context.createPeriodicWave(params.real, params.imag))
  }, [params.real, params.imag])

  function handleType(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as OscillatorType
    setParams(state => ({ ...state, type }))

    if (!instance.current) return

    if (type === 'custom') {
      instance.current.setPeriodicWave(audio.context.createPeriodicWave(params.real, params.imag))
    } else {
      instance.current.type = type
    }
  }

  type Param = 'frequency' | 'detune'
  function handleParam(param: Param, value: number) {
    setParams(state => ({ ...state, [param]: value }))
    setParam(param, value)
  }

  function setParam(param: Param, value: any) {
    if (!instance.current || value === undefined || Number.isNaN(value)) return

    instance.current[param].setValueAtTime(instance.current[param].value, audio.context.currentTime)
    instance.current[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04)
  }

  const Parameters = <FlexContainer direction='column'>
    <FlexContainer>
      <PlayButton 
        onClick={() => setParams(state => ({ ...state, playing: !state.playing }))}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        {params.playing ? 'Stop' : 'Start'}
      </PlayButton>
    </FlexContainer>
    <Hr/>
    <SelectInput
      label='Type:'
      value={params.type}
      onChange={handleType}
      options={[
        { value: 'sine', label: 'Sine' },
        { value: 'square', label: 'Square' },
        { value: 'sawtooth', label: 'Sawtooth' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'custom', label: 'Custom' },
      ]}
      expanded={params.expanded.t}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, t: v }}))}
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
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, f: v }}))}
    />
    <Hr/>
    <RangeInput
      label='Detune (cents):'
      value={params.detune}
      min={-1200}
      max={1200}
      step={0.1}
      onChange={value => handleParam('detune', value)} 
      numberInput
      numberInputWidth={NUMBER_INPUT_WIDTH}
      expanded={params.expanded.d}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, d: v }}))}
    />
    {params.type === 'custom' ? <CustomWrapper>
      <CustomName>Length:</CustomName>
      <NumberInput 
        min={2}
        step={1}
        value={params.customLength}
        onChange={v => setParams(state => ({ ...state, customLength: v }))} 
      />
      <CustomName>Real:</CustomName>
      <WaveTable>
        {Array(params.customLength).fill(0).map((_, i) => 
          <NumberInput 
            key={i}
            min={-1} 
            max={1} 
            step={0.001} 
            value={params.real[i]}
            onChange={newValue => setParams(state => {
              const newState = {...state}
              newState.real[i] = clamp(newValue, -1, 1)
              return newState
            })}
          />)}
      </WaveTable>
      <CustomName>Imaginary:</CustomName>
      <WaveTable>
        {Array(params.customLength).fill(0).map((_, i) => 
          <NumberInput 
            key={i}
            min={-1} 
            max={1} 
            step={0.001} 
            value={params.imag[i]}
            onChange={newValue => setParams(state => {
              const newState = {...state}
              newState.imag[i] = clamp(newValue, -1, 1)
              return newState
            })}
          />)}
      </WaveTable>
    </CustomWrapper> : ''}
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Oscillator'
      data={data}
      value={typeLabels[params.type]}
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
    max-width: 100px;
  }

`

const CustomWrapper = styled.div`
margin-left: 5px;
margin-right: 5px;
margin-bottom: 6px;
`

const CustomName = styled.span`
display: block;
padding-top: 2px;
padding-bottom: 2px;
`
