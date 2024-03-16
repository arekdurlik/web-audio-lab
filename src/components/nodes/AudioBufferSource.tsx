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

export function AudioBufferSource({ id, data }: AudioBufferSourceProps) {
  const [params, setParams] = useState<AudioBufferSourceParams>({
    ...{ source: 'brown-noise', playbackRate: 1, playing: false, loop: true, expanded: { s: true, pr: true }},
    ...data.params
  })
  
  const [loadedFiles, setLoadedFiles] = useState<Map<string, { name: string, buffer: AudioBuffer }>>(new Map()
  .set('white-noise', { name: 'White noise', buffer: createWhiteNoiseBuffer(audio.context) })
  .set('pink-noise', { name: 'Pink noise', buffer: createPinkNoiseBuffer(audio.context) })
  .set('brown-noise', { name: 'Brown noise', buffer: createBrownianNoiseBuffer(audio.context) })
  )
  const instance = useRef<AudioBufferSourceNode | null>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)

  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const sockets: Socket[] = [
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    },
    {
      id: controlVoltageId,
      label: 'p',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 48
    },
  ]

  useEffect(() => {
    return () => { try { 
      instance.current?.stop()
     } catch {} }
  }, [])

  useEffect(() => {
    updateNode({ params })
  }, [params])
  
  useEffect(() => {
    if (params.playing) {
      try { instance.current?.stop() } catch {}
      
      const buffer = loadedFiles.get(params.source)?.buffer

      if (buffer) {
        startBuffer(buffer)
      } else {
        console.error('Error starting buffer')
        setParams(state => ({ ...state, playing: false }))
      }

    } else {
      try { instance.current?.stop() } catch {}
    }
  }, [params.playing])
  
  function startBuffer(buffer: AudioBuffer) {
    if (params.playing && instance.current) {
      try { instance.current.stop() } catch {}
    }

    instance.current = new AudioBufferSourceNode(audio.context, { buffer, loop: params.loop })
    setInstance(audioId, instance.current, 'source')
    setInstance(controlVoltageId, instance.current.playbackRate, 'param')
    instance.current.playbackRate.value = params.playbackRate
    instance.current.start()
    instance.current.onended = () => {
      if (!params.loop) { 
        setParams(state => ({ ...state, playing: false }))
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

  if (instance.current) {
      instance.current.playbackRate.setValueAtTime(value, audio.context.currentTime)
    }
  }

  const Parameters = <FlexContainer direction='column'>
    <FlexContainer align='center'>
      <PlayButton 
        onClick={() => setParams(state => ({ ...state, playing: !state.playing }))}
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
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

const FileInput = styled.input`
display: none;
`