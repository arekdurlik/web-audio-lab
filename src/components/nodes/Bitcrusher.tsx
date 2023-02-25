import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { useReactFlow } from 'reactflow'
import { BitcrusherProps } from './types'

export function Bitcrusher({ id, data }: BitcrusherProps) {
  const [bitDepth, setBitDepth] = useState(data.bitDepth ?? 16)
  const [sampleRateReduction, setSampleRateReduction] = useState(data.sampleRateReduction ?? 1)
  const audioId = `${id}-audio`
  const instance = useRef(new AudioWorkletNode(audio.context, 'bit-crusher-processor'))
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
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

  useEffect(() => {
    setInstance(audioId, instance.current)
  }, [])

  // update reactflow and audio instance
  useEffect(() => {
    const invalid = [bitDepth, sampleRateReduction].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })
    if (invalid) return

    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = { ...node.data, bitDepth, sampleRateReduction }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)

    instance.current.parameters.get('bitDepth')?.setValueAtTime(bitDepth, audio.context.currentTime)
    instance.current.parameters.get('frequencyReduction')?.setValueAtTime(sampleRateReduction, audio.context.currentTime)
  }, [bitDepth, sampleRateReduction])

  const Parameters = <FlexContainer direction='column' gap={8}>
    <div>
    Bit depth:
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <RangeInput
          min={2}
          max={16}
          onChange={setBitDepth} 
          value={bitDepth}
          />
        <NumberInput 
          onChange={setBitDepth} 
          value={bitDepth}
          />
      </Parameter>
    </FlexContainer>
    </div>
    <div>
    Sample rate reduction:
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <RangeInput
          min={1}
          max={50}
          onChange={setSampleRateReduction} 
          value={sampleRateReduction}
          />
        <NumberInput 
          onChange={setSampleRateReduction} 
          value={sampleRateReduction}
          />
      </Parameter>
    </FlexContainer>
    </div>
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='Bitcrusher'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}