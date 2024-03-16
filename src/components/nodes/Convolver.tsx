import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { NumberInput } from '../inputs/NumberInput'
import { generateReverb } from '../../audio/generateReverb'
import { ConvolverParams, ConvolverProps, ConvolverType } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { SelectInput } from '../inputs/SelectInput'
import { CheckboxInput } from '../inputs/CheckboxInput'
import { Hr } from './BaseNode/styled'

export function Convolver({ id, data }: ConvolverProps) {
  const [params, setParams] = useState<ConvolverParams>({ 
    ...{ type: 'file', source: 'fender-twin.wav', fadeInTime: 0.1, decayTime: 5, lpFreqStart: 7000, lpFreqEnd: 1500, reverse: false, expanded: { t: true }},
    ...data.params
  })
  
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
  
  const instance = useRef(new ConvolverNode(audio.context))
  const registerInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  const [sourceBuffer, setSourceBuffer] = useState<AudioBuffer | null>(null)
  const responses = [
    'fender-twin.wav'
  ]

  useEffect(() => {
    registerInstance(audioId, instance.current, 'source')
  }, [])

  useEffect(() => {
    updateNode({ params })
  }, [params])

  // load file
  useEffect(() => {
    if (params.type === 'generate') return

    fetchResponse()
  }, [params.source])

  useEffect(() => {
    if (params.type === 'generate') return
    
    if (sourceBuffer === null) {
      fetchResponse()
    } else {
      instance.current.buffer = sourceBuffer
    }
  }, [params.type])

  // regenerate buffer
  useEffect(() => {
    if (params.type === 'file') return
  
    generateReverb(audio.context, { 
      fadeInTime: params.fadeInTime,
      decayTime: Math.max(0.01, params.decayTime),
      lpFreqStart: params.lpFreqStart,
      lpFreqEnd: params.lpFreqEnd,
      numChannels: 1,
      sampleRate: audio.context.sampleRate,
    }, (buffer: AudioBuffer) => {
      if (params.reverse) {
        buffer.getChannelData(0).reverse()
      }
      instance.current.buffer = buffer
    })
  }, [params])

  async function fetchResponse() {
    try {
      let response = await fetch(`responses/${params.source}`)
      let arraybuffer = await response.arrayBuffer()
      const buffer = await audio.context.decodeAudioData(arraybuffer)
      setSourceBuffer(buffer)
      instance.current.buffer = buffer
    } catch (e) {
      console.error(e)
    }
  }

  const Parameters = 
    <FlexContainer direction='column'>
      <SelectInput
        label='Type:'
        value={params.type}
        onChange={e => setParams(state => ({ ...state, type: e.target.value as ConvolverType }))}
        options={[
          { value: 'file', label: 'File' },
          { value: 'generate', label: 'Generate' },
        ]}
        expanded={params.expanded.t}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, t: v } }))}
      />
      <Hr/>
      {params.type === 'file' ? <SelectInput
          label='Source:'
          value={params.source}
          onChange={e => setParams(state => ({ ...state, source: e.target.value }))}
          options={responses.map((res, i) => ({ value: res, label: res }))}
      />
      : <>
        <NumberInput
          label='Fade in time:' 
          max={22000}
          value={params.fadeInTime}
          onChange={v => setParams(state => ({ ...state, fadeInTime: v }))}
          unit='s'
          width={72}
          margin
        />
        <Hr/>
        <NumberInput
          label='Decay time:'
          max={22000}
          value={params.decayTime}
          onChange={v => setParams(state => ({ ...state, decayTime: v }))}
          unit='s'
          width={72}
          margin
        />
        <Hr/>
        <NumberInput 
          label='Start lowpass filter:'
          max={22000}
          value={params.lpFreqStart}
          onChange={v => setParams(state => ({ ...state, lpFreqStart: v }))}
          unit='Hz'
          width={72}
          margin
        />
        <Hr/>
        <NumberInput 
          label='End lowpass filter:'
          max={22000}
          value={params.lpFreqEnd}
          onChange={v => setParams(state => ({ ...state, lpFreqEnd: v }))}
          unit='Hz'
          width={72}
          margin
        />
        <Hr/>
        <CheckboxInput 
          id={`${id}-reverse`}
          label='Reverse' 
          value={params.reverse} 
          onChange={() => setParams(state => ({ ...state, reverse: !state.reverse }))}
        />
      </>}
    </FlexContainer>

  return (
    <Node 
      id={id}
      name='Convolver'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}