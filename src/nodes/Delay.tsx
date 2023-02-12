import { Handle, useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { NumberInput } from '../NumberInput'
import { NodeProps } from './types'
import { NodeContainer, NodeTitle } from './styled'
import { ChangeEvent, useEffect, useState } from 'react'
import { useNodeStore } from '../nodeStore'
import { audio } from '../main'
import { positions } from './utils'
import styled from 'styled-components'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'

export function Delay(props: NodeProps) {
  const [time, setTime] = useState(0.5)
  const [rotation, setRotation] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [instance] = useState(new DelayNode(audio.context, { maxDelayTime: 10, delayTime: time }))
  const setInstance = useNodeStore(state => state.setInstance)
  const updateNodeInternals = useUpdateNodeInternals()
  const reactFlowInstance = useReactFlow()
  const socketDirection = (function() {
    switch (rotation) {
      case 1: return 'bottom'
      case 2: return 'left'
      case 3: return 'top'
      default: return 'right'
    }
  })()

  useEffect(() => {
    setInstance(props.id, instance)
  }, [])

  useEffect(() => {
    if (Number.isNaN(time)) return

    instance.delayTime.setValueAtTime(instance.delayTime.value, audio.context.currentTime)
    instance.delayTime.linearRampToValueAtTime(time, audio.context.currentTime + 0.03)
  }, [time])

  function handleDelete() {
    reactFlowInstance.deleteElements({ nodes: [{ id: props.id }]})
  }

  function handleRotate() {
    setRotation(state => (state + 1) % 4)
    updateNodeInternals(props.id)
  }

  function handleTime(event: ChangeEvent<HTMLInputElement>) {
    setTime(parseFloat(event.target.value))
  }

  return (
    <NodeContainer>
      <Expand onClick={() => setExpanded(!expanded)}>
        {expanded ? <MdExpandLess /> : <MdExpandMore />}
      </Expand>
      <StyledHandle
        type='target'
        position={positions[rotation][0]}
        style={{ top: rotation === 0 || rotation === 2 ? 22.5 : '' }}
      >
        <TriangleWrapper 
          type='target' 
          direction={socketDirection}
        >
          <Triangle direction={socketDirection} />
        </TriangleWrapper>
      </StyledHandle>
      <NodeTitle>Delay</NodeTitle>
      {expanded && <div onClick={(e) => e.stopPropagation()}>
        <NumberInput 
          label='time' 
          max={10}
          onChange={handleTime} 
          defaultValue={time}
        />
        <NodeOptions>
          <input 
            type='button'
            value='Rotate'
            onClick={handleRotate}
          />
          <input 
            type='button'
            value='Delete'
            onClick={handleDelete}
          />
        </NodeOptions>
      </div>}
      <StyledHandle
        type='source'
        position={positions[rotation][1]}
        style={{ top: rotation === 0 || rotation === 2 ? 22.5 : '' }}
      >
        <Triangle direction={socketDirection} />
        </StyledHandle>
    </NodeContainer>
  )
}

const StyledHandle = styled(Handle)`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  
`
const TriangleWrapper = styled.div<{ direction: 'right' | 'bottom' | 'left' | 'top', type?: 'source' | 'target' }>`
position: relative;

${({ direction, type }) => type === 'target' 
? direction === 'right'
  ? 'right: -2px' 
  : direction === 'bottom' 
  ? 'bottom: -2px' 
  : direction === 'left'
  ? 'left: -2px'
  : direction === 'top'
  ? 'top: -2px' : '' 
  : '' }
`

const Triangle = styled.div<{ direction: 'right' | 'bottom' | 'left' | 'top' }>`
position: relative;
width: 0; 
height: 1px;
top: -0.25px; 
border-top: 6px solid transparent;
border-bottom: 6px solid transparent;
pointer-events: none;
border-left: 10px solid #000;

${({ direction }) => direction === 'bottom' 
  ? 'transform: rotate(90deg)' 
  : direction === 'left'
  ? 'transform: rotate(180deg)'
  : direction === 'top'
  ? 'transform: rotate(-90deg)' : ''
}
`


const Expand = styled.div`
position: absolute;
padding: 3px;
top: 0;
right: 0;
display: flex;
justify-content: center;
align-items: center;
`

const NodeOptions = styled.div`
position: relative;
width: 100%;
display: flex;
align-items: flex-end;
justify-content: flex-end;
gap: 5px;
padding-top: 10px;

& > * {
  display: flex;
  align-items: flex-end;
}
`

