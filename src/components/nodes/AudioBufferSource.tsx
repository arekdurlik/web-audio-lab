import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { createBrownianNoiseBuffer, createPinkNoiseBuffer, createWhiteNoiseBuffer } from '../../audio/utils'
import { AudioBufferSourceProps } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { RangeInput } from '../inputs/RangeInput'
import { SelectInput } from '../inputs/SelectInput'
import { CheckboxInput } from '../inputs/CheckboxInput'
import styled from 'styled-components'
import { PlayButton } from './styled'
import { Hr } from './BaseNode/styled'

export function AudioBufferSource({ id, data }: AudioBufferSourceProps) {
  const [source, setSource] = useState(data.source ?? 'brown-noise')
  const [playbackRate, setPlaybackRate] = useState(data.playbackRate ?? 1)
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [loop, setLoop] = useState(data.loop ?? true)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    s: true, pr: true,
  })
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loadedFiles, setLoadedFiles] = useState<Map<string, { name: string, buffer: AudioBuffer }>>(new Map()
    .set('white-noise', { name: 'White noise', buffer: createWhiteNoiseBuffer(audio.context) })
    .set('pink-noise', { name: 'Pink noise', buffer: createPinkNoiseBuffer(audio.context) })
    .set('brown-noise', { name: 'Brown noise', buffer: createBrownianNoiseBuffer(audio.context) })
  )
  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const instance = useRef<AudioBufferSourceNode | null>()
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
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
    updateNode({ playing, loop, playbackRate })
  }, [playing, loop, playbackRate])
  
  useEffect(() => {
    if (playing) {
      try { instance.current?.stop() } catch {}
      
      const buffer = loadedFiles.get(source)?.buffer

      if (buffer) {
        startBuffer(buffer)
      } else {
        console.error('Error starting buffer')
      }

    } else {
      try { instance.current?.stop() } catch {}
    }
  }, [playing])
  
  function getBuffer(type: string) {
    let buffer: AudioBuffer

    switch(type) {
      case 'pink-noise': buffer = createPinkNoiseBuffer(audio.context); break
      case 'brown-noise': buffer = createBrownianNoiseBuffer(audio.context); break
      default: buffer = createWhiteNoiseBuffer(audio.context); break
    }
    return buffer
  }
  
  function startBuffer(buffer: AudioBuffer) {
    if (playing && instance.current) {
      try { instance.current.stop() } catch {}
    }

    instance.current = new AudioBufferSourceNode(audio.context, { buffer, loop })
    setInstance(audioId, instance.current, 'source')
    setInstance(controlVoltageId, instance.current.playbackRate, 'param')
    instance.current.playbackRate.value = playbackRate
    instance.current.start()
    instance.current.onended = () => {
      if (!loop) { 
        setPlaying(false)
      }
    }
  }
  
  function handleSource(event: ChangeEvent<HTMLSelectElement>) {
    const name = event.target.value
    setSource(name)
    
    if (playing) {
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

    setSource(file.name)
    
    if (playing) {
      startBuffer(audioBuffer)
    }
  }
  
  function handlePlaybackRate(value: number) {
    setPlaybackRate(value)

  if (instance.current) {
      instance.current.playbackRate.setValueAtTime(value, audio.context.currentTime)
    }
  }

  const Parameters = <FlexContainer direction='column'>
    <FlexContainer align='center'>
      <PlayButton 
        onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        {playing ? 'Stop' : 'Start'}
      </PlayButton>
      <CheckboxInput
        label='Loop'
        id={`${id}-loop`}
        value={loop}
        onChange={() => setLoop(!loop)}
      />
    </FlexContainer>
    <Hr/>
    <SelectInput
      label='Source:'
      value={source}
      onChange={handleSource}
      options={Array.from(loadedFiles).map(([k, v], i) => ({ value: k, label: v.name }))}
      expanded={expanded.s}
      onExpandChange={value => setExpanded(state => ({ ...state, s: value }))}
    />
    {expanded.s && <FlexContainer>
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
      value={playbackRate}
      min={0}
      max={2}
      onChange={handlePlaybackRate}
      numberInput
      expanded={expanded.pr}
      onExpandChange={value => setExpanded(state => ({ ...state, pr: value }))}
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