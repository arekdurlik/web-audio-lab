import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { createBrownianNoiseBuffer, createPinkNoiseBuffer, createWhiteNoiseBuffer } from '../../audio/utils'
import { AudioBufferSourceParams, AudioBufferSourceProps } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { RangeInput } from '../inputs/RangeInput'
import { SelectInput } from '../inputs/SelectInput'
import { CheckboxInput } from '../inputs/CheckboxInput'
import styled from 'styled-components'
import { PlayButton } from './styled'
import { Hr } from './BaseNode/styled'
import { nodeSizes } from '../FlowEditor/utils'

export function AudioBufferSource({ id, data }: AudioBufferSourceProps) {
  const [params, setParams] = useState<AudioBufferSourceParams>({
    ...{ source: 'brown-noise', playbackRate: 1, playing: false, loop: true, expanded: { s: true, pr: true }},
    ...data.params
  })
  const playingRef = useRef(params.playing)

  const [loadedFiles, setLoadedFiles] = useState<Map<string, { name: string, buffer: AudioBuffer }>>(new Map()
  .set('white-noise', { name: 'White noise', buffer: createWhiteNoiseBuffer(audio.context) })
  .set('pink-noise', { name: 'Pink noise', buffer: createPinkNoiseBuffer(audio.context) })
  .set('brown-noise', { name: 'Brown noise', buffer: createBrownianNoiseBuffer(audio.context) })
  )
  const instance = useRef<AudioBufferSourceNode | null>()
  const counterSource = useRef<AudioBufferSourceNode | null>()
  const duration = useRef(new ConstantSourceNode(audio.context, { offset: 0 }))
  const trigger = useRef(new ConstantSourceNode(audio.context, { offset: 0 }))
  const playbackRateParam = useRef(new ConstantSourceNode(audio.context, { offset: 0 }))
  const prp = useRef(new AudioWorkletNode(audio.context, 'playback-reporting-processor'))

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)

  const audioId = `${id}-audio`
  const durationId = `${id}-duration`
  const triggerId = `${id}-trigger`
  const controlVoltageId = `${id}-cv`
  const sockets: Socket[] = [
    {
      id: triggerId,
      type: 'source',
      edge: 'right',
      tooltip: 'Playback trigger',
      offset: 56
    },
    {
      id: durationId,
      type: 'source',
      edge: 'right',
      tooltip: 'Duration',
      offset: 40
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      tooltip: 'Audio',
      offset: 24
    },
    {
      id: controlVoltageId,
      label: 'p',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 48.5
    },
  ]
  
  useEffect(() => {
    setInstance(controlVoltageId, playbackRateParam.current.offset, 'param')
    
    prp.current.port.onmessage = function() {
      if (!playingRef.current) return

      trigger.current.offset.cancelScheduledValues(audio.context.currentTime)
      trigger.current.offset.value = 1
      trigger.current.offset.setValueAtTime(0, audio.context.currentTime + 0.1)
    }
    
    try {
      playbackRateParam.current.start()
      trigger.current.start()
      duration.current.start()
    } catch {}

    return () => { try { 
      instance.current?.stop()
      counterSource.current?.stop() 
     } catch {} }
  }, [])

  useEffect(() => {
    if (params.playing) {
      trigger.current.offset.cancelScheduledValues(audio.context.currentTime)
      trigger.current.offset.value = 1
      trigger.current.offset.setValueAtTime(0, audio.context.currentTime + 0.03)
    }
  }, [params.playing])

  useEffect(() => {
    updateNode({ params })
  }, [params])
  
  useEffect(() => {
    if (params.playing) {
      try { 
        instance.current?.stop() 
        counterSource.current?.stop() 
      } catch {}
      
      const buffer = loadedFiles.get(params.source)?.buffer

      if (buffer) {
        startBuffer(buffer)
      } else {
        console.error('Error starting buffer')
        setPlaying(false)
      }

    } else {
      try { 
        instance.current?.stop() 
        counterSource.current?.stop()
      } catch {}
    }
  }, [params.playing])

  function setPlaying(value: boolean) {
    setParams(state => ({ ...state, playing: value }))
        playingRef.current = value
  }
  
  function startBuffer(buffer: AudioBuffer) {
    if (params.playing && instance.current) {
      try { 
        instance.current.stop() 
        counterSource.current?.stop()
      } catch {}
    }

    instance.current = new AudioBufferSourceNode(audio.context, { buffer, loop: params.loop })
    counterSource.current = new AudioBufferSourceNode(audio.context, { loop: params.loop })
    playbackRateParam.current.connect(instance.current.playbackRate)
    playbackRateParam.current.connect(counterSource.current.playbackRate)

    const counterBuffer = audio.context.createBuffer(1, buffer.length, audio.context.sampleRate)
    const length = counterBuffer.length
    counterSource.current.buffer = counterBuffer
    
    // [0, 1)
    for (let i = 0; i < length; ++i) {
      counterBuffer.getChannelData(0)[i] = i / length
    }

    counterSource.current.connect(prp.current)
    counterSource.current.start()
    duration.current.offset.value = buffer.duration
    
    setInstance(audioId, instance.current, 'source')
    setInstance(durationId, duration.current, 'source')
    setInstance(triggerId, trigger.current, 'source')
    
    instance.current.playbackRate.value = params.playbackRate
    counterSource.current.playbackRate.value = params.playbackRate

    instance.current.start()
    instance.current.onended = () => {
      if (!params.loop) { 
        setPlaying(false)
      }
    }
  }
  
  function handleSource(event: ChangeEvent<HTMLSelectElement>) {
    const name = event.target.value
    setParams(state => ({ ...state, source: name }))
    
    if (params.playing) {
      const file = loadedFiles.get(name)

      if (file) {
        const buffer = file.buffer
        startBuffer(buffer)
      } else {
        console.error(`File "${name}" not found in Map`)
      }
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null

    if (file === null) return

    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audio.context.decodeAudioData(arrayBuffer)
    
    setLoadedFiles(state => new Map([
      ...state.entries(),
      [file.name, { name: file.name, buffer: audioBuffer }]
    ]))

    setParams(state => ({ ...state, source: file.name }))
    
    if (params.playing) {
      startBuffer(audioBuffer)
    }
  }
  
  function handlePlaybackRate(value: number) {
    setParams(state => ({ ...state, playbackRate: value }))

  if (instance.current && counterSource.current) {
      instance.current.playbackRate.setValueAtTime(value, audio.context.currentTime)
      counterSource.current.playbackRate.setValueAtTime(value, audio.context.currentTime)
    }
  }

  const Parameters = <FlexContainer direction='column'>
    <FlexContainer align='center'>
      <PlayButton 
        onClick={() => { setParams(state => ({ ...state, playing: !state.playing })); playingRef.current = !playingRef.current}}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        {params.playing ? 'Stop' : 'Start'}
      </PlayButton>
      <CheckboxInput
        label='Loop'
        id={`${id}-loop`}
        value={params.loop}
        onChange={() => setParams(state => ({ ...state , loop: !state.loop }))}
      />
    </FlexContainer>
    <Hr/>
    <SelectInput
      label='Source:'
      value={params.source}
      onChange={handleSource}
      options={Array.from(loadedFiles).map(([k, v], i) => ({ value: k, label: v.name }))}
      expanded={params.expanded.s}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, s: v }}))}
    />
    {params.expanded.s && <FlexContainer>
      <PlayButton 
        onClick={() => fileInputRef.current?.click()}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        Load file
      </PlayButton>
      <FileInput ref={fileInputRef} id="audio-file" accept="audio/*" type="file" onChange={handleFileChange}/>
    </FlexContainer>}
    <Hr/>
    <RangeInput
      label='Playback rate:'
      value={params.playbackRate}
      min={0}
      max={2}
      onChange={handlePlaybackRate}
      numberInput
      expanded={params.expanded.pr}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, pr: v }}))}
    />
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Audio source'
      height={nodeSizes.audioBufferSourceNode.y}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
      labelPosition={[[18, 0], [9, 0]]}
    />
  )
}

const FileInput = styled.input`
display: none;
`
