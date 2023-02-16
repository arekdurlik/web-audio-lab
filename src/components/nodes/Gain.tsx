import { NodeProps } from './types'
import { ChangeEvent, useEffect, useState } from 'react'
import { Parameter } from './Node/styled'
import { Node } from './Node'
import { Socket } from './Node/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'

export function Gain({ id, data }: NodeProps) {
  const [gain, setGain] = useState(1)
  const [max, setMax] = useState<string | number>(2)
  const [min, setMin] = useState<string | number>(-2)
  const audioId = `${id}-audio`
  const controlVoltageId = `${id}-cv`
  const [instance] = useState(new GainNode(audio.context))
  const setInstance = useNodeStore(state => state.setInstance)
  const sockets: Socket[] = [
    {
      id: audioId,
      label: 'in',
      type: 'target',
      edge: 'left',
      offset: 40
    },
    {
      id: controlVoltageId,
      label: 'cv',
      visual: 'triangle',
      type: 'target',
      edge: 'top',
      offset: 50
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 20
    }
  ]

  useEffect(() => {
    instance.gain.value = gain
    setInstance(audioId, instance)
    setInstance(controlVoltageId, instance.gain)

    const constant = new ConstantSourceNode(audio.context, { offset: 0 })
    constant.connect(instance.gain)
    constant.start()
  }, [])

  useEffect(() => {
    if (!gain || Number.isNaN(gain)) return

    instance.gain.setValueAtTime(instance.gain.value, audio.context.currentTime)
    instance.gain.linearRampToValueAtTime(gain, audio.context.currentTime + 0.03)
  }, [gain])

  function handleGain(event: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(event.target.value)
    setGain(value)
  }

  const Parameters = <>
    Gain:
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <RangeInput
          min={min}
          max={max}
          onChange={handleGain} 
          defaultValue={gain}
          value={gain}
          />
        <NumberInput 
          onChange={handleGain} 
          value={gain}
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
  </>

  return (
    <Node 
      id={id}
      name='Gain'
      data={data}
      width={100}
      height={60}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}


