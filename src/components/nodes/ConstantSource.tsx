import { ConstantSourceProps } from './types'
import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { useReactFlow } from 'reactflow'
import { PlayButton } from './styled'
import { Hr } from './BaseNode/styled'

export function ConstantSource({ id, data }: ConstantSourceProps) {
  const [playing, setPlaying] = useState(data.playing ?? false)
  const [offset, setOffset] = useState(data.offset ?? 0)
  const [min, setMin] = useState(data.min ?? 0)
  const [max, setMax] = useState(data.max ?? 1)

  const [ramp, setRamp] = useState(data.ramp ?? 0.04)
  const [rampMin, setRampMin] = useState(data.rampMin ?? 0)
  const [rampMax, setRampMax] = useState(data.rampMax ?? 2)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    o: true, r: false
  })

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
    
    instance.current.offset.cancelScheduledValues(audio.context.currentTime)
    instance.current.offset.setValueAtTime(instance.current.offset.value, audio.context.currentTime)
    instance.current.offset.linearRampToValueAtTime(offset, audio.context.currentTime + ramp)
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

  const Parameters = <FlexContainer direction='column'>
    <FlexContainer>
      <PlayButton onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}>{playing ? 'Stop' : 'Start'}</PlayButton>
    </FlexContainer>
    <Hr/>
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
      expanded={expanded.o}
      onExpandChange={value => setExpanded(state => ({ ...state, o: value }))}
    />
    <Hr/>
    <RangeInput
      label='Ramp:'
      value={ramp}
      min={rampMin}
      max={rampMax}
      onChange={setRamp}
      numberInput
      adjustableBounds
      onMinChange={setRampMin}
      onMaxChange={setRampMax}
      expanded={expanded.r}
      onExpandChange={value => setExpanded(state => ({ ...state, r: value }))}
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


