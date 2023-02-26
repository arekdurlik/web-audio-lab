import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Parameter, ParameterName } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { NumberInput } from '../inputs/NumberInput'
import { generateReverb } from '../../audio/generateReverb'
import { Select } from '../inputs/styled'
import { ConvolverProps, ConvolverType } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

type Param = 'fade-in-time' | 'decay-time' | 'lp-freq-start' | 'lp-freq-end'

export function Convolver({ id, data }: ConvolverProps) {
  const [type, setType] = useState<ConvolverType>(data.type ?? 'file')
  const [source, setSource] = useState(data.source ?? 'fender-twin.wav')
  const [sourceBuffer, setSourceBuffer] = useState<AudioBuffer | null>(null)
  const [fadeInTime, setFadeInTime] = useState<string | number>(data.fadeInTime ?? 0.1)
  const [decayTime, setDecayTime] = useState<string | number>(data.decayTime ?? 5)
  const [lpFreqStart, setLpFreqStart] = useState<string | number>(data.lpFreqStart ?? 7000)
  const [lpFreqEnd, setLpFreqEnd] = useState<string | number>(data.lpFreqEnd ?? 1500)
  const [reverse, setReverse] = useState(data.reverse ?? false)
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

  function handleParam(param: Param, value: number) {
    switch (param) {
      case 'fade-in-time': setFadeInTime(value); break
      case 'decay-time': setDecayTime(value); break
      case 'lp-freq-start': setLpFreqStart(value); break
      case 'lp-freq-end': setLpFreqEnd(value); break
    }
  }

  async function handleSource(event: ChangeEvent<HTMLSelectElement>) {
    setSource( event.target.value)
  }

  const Parameters = <FlexContainer 
    direction='column' 
    gap={8}
  >
    <div>
      Type:
      <Parameter>
        <Select 
          value={type}
          onChange={(e) => setType(e.target.value as ConvolverType)} 
        >
          <option value='file'>File</option>
          <option value='generate'>Generate</option>
        </Select>
      </Parameter>
    </div>
    {type === 'file' ? <div>
      Source:
      <Parameter>
        <Select 
          value={source}
          onChange={handleSource} 
        >
          {responses.map((res, i) => <option key={i} value={res}>{res}</option>)}
        </Select>
      </Parameter>
    </div>
    : <>
      <div>
        <ParameterName>Fade in time:</ParameterName>
        <Parameter>
          <NumberInput 
            max={22000}
            onChange={value => handleParam('fade-in-time', value)} 
            unit='s'
            width={72}
            value={fadeInTime}
          />
        </Parameter>
      </div>
      <div>
        <ParameterName>Decay time:</ParameterName>
        <Parameter>

          <NumberInput 
            max={22000}
            onChange={value => handleParam('decay-time', value)} 
            unit='s'
            width={72}
            value={decayTime}
          />
        </Parameter>
      </div>

      <div>
        <ParameterName>Start lowpass filter:</ParameterName>
        <Parameter>

          <NumberInput 
            max={22000}
            onChange={value => handleParam('lp-freq-start', value)} 
            unit='Hz'
            width={72}
            value={lpFreqStart}
          />
        </Parameter>
      </div>

      <div>
        <ParameterName>End lowpass filter:</ParameterName>
        <Parameter>

          <NumberInput 
            max={22000}
            onChange={value => handleParam('lp-freq-end', value)} 
            unit='Hz'
            width={72}
            value={lpFreqEnd}
          />
        </Parameter>
      </div>

      <div>
        Reverse:
        <input 
          type='checkbox' 
          checked={reverse} 
          onChange={() => setReverse(!reverse)}
        />
      </div>
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