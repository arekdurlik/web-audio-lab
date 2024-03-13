import { ConstantSourceProps } from './types'
import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { useReactFlow } from 'reactflow'

export function ConstantSource({ id, data }: ConstantSourceProps) {
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [offset, setOffset] = useState(data.offset ?? 0)
  const [min, setMin] = useState(data.min ?? 0)
  const [max, setMax] = useState(data.max ?? 1)
  const signalId = `${id}-signal`
  const offsetId = `${id}-offset`
  const instance = useRef(new ConstantSourceNode(audio.context, { offset: offset }))
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const sockets: Socket[] = [
    {
      id: signalId,
      type: 'source',
      edge: 'right',
      offset: 24
    },
    {
      id: offsetId,
      label: 'o',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 48
    },
  ]

  useEffect(() => {
    return () => { try { 
      instance.current.offset.value = 0
      instance.current.stop()
     } catch {} }
  }, [])

  useEffect(() => {
    const invalid = [offset, min, max].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })
    if (invalid) return

    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, playing, offset, min, max }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)
  }, [playing, offset, max, min])

  
  useEffect(() => {
    if (offset === undefined || Number.isNaN(offset)) return
    
    instance.current.offset.setValueAtTime(instance.current.offset.value, audio.context.currentTime)
    instance.current.offset.linearRampToValueAtTime(offset, audio.context.currentTime + 0.03)
  }, [offset])
  
  useEffect(() => {
    if (playing) {
      try { instance.current.stop() } catch {}
      instance.current = new ConstantSourceNode(audio.context, { offset })

      setInstance(signalId, instance.current, 'source')
      setInstance(offsetId, instance.current.offset, 'param')
      instance.current.start()
    } else {
      try { instance.current.stop() } catch {}
    }
  }, [playing])

  const Parameters = <FlexContainer direction='column' gap={8}>
    <FlexContainer gap={8}>
      <button onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}>{playing ? 'Stop' : 'Start'}</button>
    </FlexContainer>
    <RangeInput
      label='Offset:'
      value={offset}
      min={min}
      max={max}
      onChange={setOffset}
      numberInput
      adjustableBounds
      onMinChange={setMin}
      onMaxChange={setMax}
    />
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Constant'
      value={offset}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}


