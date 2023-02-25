import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { useReactFlow } from 'reactflow'
import { Select } from '../inputs/styled'
import { createBrownianNoiseBuffer, createPinkNoiseBuffer, createWhiteNoiseBuffer } from '../../audio/utils'
import { AudioBufferSourceFile, AudioBufferSourceProps } from './types'

export function AudioBufferSource({ id, data }: AudioBufferSourceProps) {
  const [source, setSource] = useState<AudioBufferSourceFile>(data.source ?? 'white-noise')
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [loop, setLoop] = useState(data.loop ?? true)
  const audioId = `${id}-audio`
  const instance = useRef<AudioBufferSourceNode | null>()
  const registerInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const sockets: Socket[] = [
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  useEffect(() => {
    return () => { try { 
      instance.current?.stop()
     } catch {} }
  }, [])

  useEffect(() => {
    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, playing, source, loop }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)
  }, [playing, source, loop])
  
  useEffect(() => {
    if (playing) {
      try { instance.current?.stop() } catch {}
      
      startBuffer(source)
    } else {
      try { instance.current?.stop() } catch {}
    }
  }, [playing])
  
  function getBuffer(type: AudioBufferSourceFile) {
    let buffer: AudioBuffer

    switch(type) {
      case 'pink-noise': buffer = createPinkNoiseBuffer(audio.context); break
      case 'brownian-noise': buffer = createBrownianNoiseBuffer(audio.context); break
      default: buffer = createWhiteNoiseBuffer(audio.context); break
    }
    return buffer
  }

  function startBuffer(type: AudioBufferSourceFile) {
    const buffer = getBuffer(type)
      instance.current = new AudioBufferSourceNode(audio.context, { buffer, loop })
      registerInstance(audioId, instance.current)
      instance.current.start()
      instance.current.onended = () => {
        if (!loop) { 
          setPlaying(false)
        }
      }
  }
  
  function handleSource(event: ChangeEvent<HTMLSelectElement>) {
    if (playing && instance.current) {
      try { instance.current.stop() } catch {}
    }

    const type = event.target.value as AudioBufferSourceFile
    setSource(type)
    
    if (playing) {
      startBuffer(type)
    }
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <FlexContainer gap={8}>
      <button onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}>{playing ? 'Stop' : 'Start'}</button>
    </FlexContainer>
    <div>
      Source:
      <Parameter>
        <Select onChange={handleSource} value={source}>
          <option value='white-noise'>White noise</option>
          <option value='pink-noise'>Pink noise</option>
          <option value='brownian-noise'>Brown noise</option>
        </Select>
      </Parameter>
    </div>
    <div>
      Loop:
      <input type='checkbox' checked={loop} onChange={() => setLoop(!loop)}/>
    </div>
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