import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { NumberInput } from '../inputs/NumberInput'
import { generateReverb } from '../../audio/generateReverb'
import { ConvolverProps, ConvolverType } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { SelectInput } from '../inputs/SelectInput'
import { CheckboxInput } from '../inputs/CheckboxInput'
import { Hr } from './BaseNode/styled'

export function Convolver({ id, data }: ConvolverProps) {
  const [type, setType] = useState<ConvolverType>(data.type ?? 'file')
  const [source, setSource] = useState(data.source ?? 'fender-twin.wav')
  const [sourceBuffer, setSourceBuffer] = useState<AudioBuffer | null>(null)
  const [fadeInTime, setFadeInTime] = useState(data.fadeInTime ?? 0.1)
  const [decayTime, setDecayTime] = useState(data.decayTime ?? 5)
  const [lpFreqStart, setLpFreqStart] = useState(data.lpFreqStart ?? 7000)
  const [lpFreqEnd, setLpFreqEnd] = useState(data.lpFreqEnd ?? 1500)
  const [reverse, setReverse] = useState(data.reverse ?? false)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    t: true
  })

  const audioId = `${id}-audio`
  const instance = useRef(new ConvolverNode(audio.context))
  const registerInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
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

  const responses = [
    'fender-twin.wav'
  ]

  useEffect(() => {
    registerInstance(audioId, instance.current, 'source')
  }, [])

  useEffect(() => {
    updateNode({ type, source, fadeInTime, decayTime, lpFreqStart, lpFreqEnd, reverse })
  }, [type, source, fadeInTime, decayTime, lpFreqStart, lpFreqEnd, reverse])

  // load file
  useEffect(() => {
    if (type === 'generate') return

    fetchResponse()
  }, [source])

  useEffect(() => {
    if (type === 'generate') return
    
    if (sourceBuffer === null) {
      fetchResponse()
    } else {
      instance.current.buffer = sourceBuffer
    }
  }, [type])

  // regenerate buffer
  useEffect(() => {
    if (type === 'file') return
    
    const invalid = [fadeInTime, decayTime, lpFreqStart, lpFreqEnd].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })
    
    if (invalid) return

    generateReverb(audio.context, { 
      fadeInTime: fadeInTime as number,
      decayTime: Math.max(0.01, decayTime as number),
      lpFreqStart: lpFreqStart as number,
      lpFreqEnd: lpFreqEnd as number,
      numChannels: 1,
      sampleRate: audio.context.sampleRate,
    }, (buffer: AudioBuffer) => {
      if (reverse) {
        buffer.getChannelData(0).reverse()
      }
      instance.current.buffer = buffer
    })
  }, [type, fadeInTime, decayTime, lpFreqStart, lpFreqEnd, reverse])

  async function fetchResponse() {
    try {
      let response = await fetch(`responses/${source}`)
      let arraybuffer = await response.arrayBuffer()
      const buffer = await audio.context.decodeAudioData(arraybuffer)
      setSourceBuffer(buffer)
      instance.current.buffer = buffer
    } catch (e) {
      console.error(e)
    }
  }

  async function handleSource(event: ChangeEvent<HTMLSelectElement>) {
    setSource( event.target.value)
  }

  const Parameters = 
    <FlexContainer direction='column'>
      <SelectInput
        label='Type:'
        value={type}
        onChange={(e) => setType(e.target.value as ConvolverType)}
        expanded={expanded.t}
        onExpandChange={value => setExpanded(state => ({ ...state, t: value }))}
        options={[
          { value: 'file', label: 'File' },
          { value: 'generate', label: 'Generate' },
        ]}
      />
      <Hr/>
      {type === 'file' ? <SelectInput
          label='Source:'
          value={source}
          onChange={handleSource}
          options={responses.map((res, i) => ({ value: res, label: res }))}
      />
      : <>
        <NumberInput
          label='Fade in time:' 
          max={22000}
          onChange={setFadeInTime} 
          unit='s'
          width={72}
          value={fadeInTime}
          margin
        />
        <Hr/>
        <NumberInput
          label='Decay time:'
          max={22000}
          onChange={setDecayTime} 
          unit='s'
          width={72}
          value={decayTime}
          margin
        />
        <Hr/>
        <NumberInput 
          label='Start lowpass filter:'
          max={22000}
          onChange={setLpFreqStart} 
          unit='Hz'
          width={72}
          value={lpFreqStart}
          margin
        />
        <Hr/>
        <NumberInput 
          label='End lowpass filter:'
          max={22000}
          onChange={setLpFreqEnd} 
          unit='Hz'
          width={72}
          value={lpFreqEnd}
          margin
        />
        <Hr/>
        <CheckboxInput 
          id={`${id}-reverse`}
          label='Reverse' 
          value={reverse} 
          onChange={() => setReverse(!reverse)}
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