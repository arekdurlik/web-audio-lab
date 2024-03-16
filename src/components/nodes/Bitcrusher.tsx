import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { RangeInput } from '../inputs/RangeInput'
import { BitcrusherProps } from './types'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { Hr } from './BaseNode/styled'

export function Bitcrusher({ id, data }: BitcrusherProps) {
  const [bitDepth, setBitDepth] = useState(data.bitDepth ?? 16)
  const [sampleRateReduction, setSampleRateReduction] = useState(data.sampleRateReduction ?? 1)

  const [expanded, setExpanded] = useState(data.expanded ?? {
    g: true, r: false
  })
  
  const audioId = `${id}-audio`
  const instance = useRef(new AudioWorkletNode(audio.context, 'bit-crusher-processor'))
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
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  useEffect(() => {
    setInstance(audioId, instance.current, 'source')
  }, [])

  // update reactflow and audio instance
  useEffect(() => {
    const invalid = [bitDepth, sampleRateReduction].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    updateNode({ bitDepth, sampleRateReduction })
    instance.current.parameters.get('bitDepth')?.setValueAtTime(bitDepth, audio.context.currentTime)
    instance.current.parameters.get('frequencyReduction')?.setValueAtTime(sampleRateReduction, audio.context.currentTime)
  }, [bitDepth, sampleRateReduction])

  const Parameters = 
    <FlexContainer direction='column'>
      <RangeInput
        label='Bit depth:'
        value={bitDepth}
        min={2}
        max={16}
        step={1}
        onChange={setBitDepth}
        numberInput
        expanded={expanded.b}
        onExpandChange={value => setExpanded(state => ({ ...state, b: value }))}
      />
      <Hr/>
      <RangeInput
        label='Sample rate reduction:'
        value={sampleRateReduction}
        min={1}
        max={50}
        step={1}
        onChange={setSampleRateReduction}
        numberInput
        expanded={expanded.s}
        onExpandChange={value => setExpanded(state => ({ ...state, s: value }))}
      />
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