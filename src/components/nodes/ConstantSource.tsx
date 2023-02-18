import { NodeProps } from './types'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'

export function ConstantSource({ id, data }: NodeProps) {
  const [playing, setPlaying] = useState(false)
  const [offset, setOffset] = useState(1)
  const [max, setMax] = useState<string | number>(2)
  const [min, setMin] = useState<string | number>(-2)
  const signalId = `${id}-signal`
  const offsetId = `${id}-offset`
  const instance = useRef(new ConstantSourceNode(audio.context, { offset: offset }))
  const setInstance = useNodeStore(state => state.setInstance)
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
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 48
    },
  ]

  useEffect(() => {
    setInstance(signalId, instance.current)
    setInstance(offsetId, instance.current.offset)
  }, [])

  useEffect(() => {
    if (!offset || Number.isNaN(offset)) return

    instance.current.offset.setValueAtTime(instance.current.offset.value, audio.context.currentTime)
    instance.current.offset.linearRampToValueAtTime(offset, audio.context.currentTime + 0.03)
  }, [offset])

  function handleStart() {
    try { instance.current.stop() } catch {}
    instance.current = new ConstantSourceNode(audio.context, { offset: offset })

    setInstance(signalId, instance.current)
    setInstance(offsetId, instance.current.offset)
    setPlaying(true)
    instance.current.start()
  }

  function handleStop() {
    try { instance.current.stop() } catch {}
    setPlaying(false)
  }

  function handleOffset(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    setOffset(value)
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <FlexContainer gap={8}>
      <button onClick={playing ? handleStop : handleStart}>{playing ? 'Stop' : 'Start'}</button>
    </FlexContainer>
    <div>
    Offset:
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <RangeInput
          min={min}
          max={max}
          onChange={handleOffset} 
          value={offset}
          />
        <NumberInput 
          onChange={handleOffset} 
          value={offset}
          />
      </Parameter>
      <FlexContainer
        justify='flex-end'
        gap={8}
      >
      <FlexContainer gap={2}>
        min:
        <NumberInput 
          width={50}
          onChange={(e) => setMin(e.target.value)} 
          value={min}
        />
      </FlexContainer>
      <FlexContainer gap={2}>
        max:
        <NumberInput 
          width={50}
          onChange={(e) => setMax(e.target.value)} 
          value={max}
        />
      </FlexContainer>
      </FlexContainer>
    </FlexContainer>
    </div>
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


