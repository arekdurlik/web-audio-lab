import { StereoPannerProps } from './types'
import { useEffect, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

export function StereoPanner({ id, data }: StereoPannerProps) {
  const [pan, setPan] = useState(data.pan ?? 0)
  const audioId = `${id}-audio`
  const panId = `${id}-pan`
  const [instance] = useState(new StereoPannerNode(audio.context))
  const setInstance = useNodeStore(state => state.setInstance)
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
      id: panId,
      label: 'p',
      visual: 'param',
      type: 'target',
      edge: 'top',
      offset: 48
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  useEffect(() => {
    instance.pan.value = pan
    setInstance(audioId, instance, 'source')
    setInstance(panId, instance.pan, 'param')
  }, [])

  useEffect(() => {
    if (pan === undefined || Number.isNaN(pan)) return
    
    updateNode(pan)
    instance.pan.setValueAtTime(instance.pan.value, audio.context.currentTime)
    instance.pan.linearRampToValueAtTime(pan, audio.context.currentTime + 0.03)
  }, [pan])

  const Parameters = <FlexContainer direction='column' gap={8}>
    <div>
    Pan:
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <RangeInput
          min={-1}
          max={1}
          onChange={setPan} 
          value={pan}
          />
        <NumberInput 
          min={-1}
          max={1}
          onChange={setPan} 
          value={pan}
          />
      </Parameter>
    </FlexContainer>
    </div>
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Stereo panner'
      value={pan}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}