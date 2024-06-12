import { useState } from 'react'
import { NodeProps } from '../types'
import { Handle, useUpdateNodeInternals } from 'reactflow'
import styled from 'styled-components'
import { HoverOptions, LeftOptions, Rotate } from '../BaseNode/styled'
import { Edge } from '../BaseNode/types'
import { getEdgeIndex, positions } from '../utils'
import { useFlowStore } from '../../../stores/flowStore'
import { Option } from '../BaseNode'
import NodeDelete from '/svg/node_delete.svg'
import NodeRotate from '/svg/node_rotate.svg'
import { useUpdateFlowNode } from '../../../hooks/useUpdateFlowNode'

type SocketOnlyProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
  }
  defaultRotation?: 0 | 1 | 2 | 3
  label: string,
  socket: {
    id: string
    type: 'source' | 'target'
    offset: number
  }
}


export function SocketOnly({ id, data, defaultRotation = 0, label, socket }: SocketOnlyProps) {
  const [active, setActive] = useState(false)
  const [rotation, setRotation] = useState<0 | 1 | 2 | 3>(data.rotation ?? defaultRotation)
  const updateNodeInternals = useUpdateNodeInternals()
  const { deleteNode } = useUpdateFlowNode(id)
  const { editMode } = useFlowStore()

  function handleRotate() {
    setRotation(state => (state + 1) % 4 as any)
    updateNodeInternals(id)
  }

  return (
    <div
      onPointerOver={() => setActive(true)}
      onPointerOut={() => setActive(false)} 
    >
      <Wrapper>
      {active && <SocketOnlyHoverOptions>
          <LeftOptions>
            {editMode && <Option title='Rotate node' src={NodeRotate} onClick={handleRotate} width={8} height={8}/>}
          </LeftOptions>
          {editMode && <div><Option title='Delete node' src={NodeDelete} onClick={deleteNode} width={8} height={8}/></div>}
        </SocketOnlyHoverOptions>}
        <Label rotation={rotation}>{label}</Label>
        <CircleHandle 
          rotation={rotation} 
          position={positions[rotation][2]}
          {...socket} 
        />
      </Wrapper>
    </div>
  )
}


const SocketOnlyHoverOptions = styled(HoverOptions)`
width: 31px;
top: -10px;
left: -15px;
padding-bottom: 5px;
`

const Wrapper = styled.div`
display: grid;
place-items: center;
margin: 0;
`

const RotateWrapper = styled.div`
display: flex;
position: relative;
bottom: 30px;
right: 25px;
padding: 10px;
`

const Label = styled.span<{ rotation: 0 | 1 | 2 | 3 }>`
display: grid;
padding: 5px;
place-items: center;
  position: absolute;
  ${({ rotation }) => {
  switch (rotation) {
    case 0: return `left: -45px;
    top: -2px;`
    case 1:
    case 2:
    case 3: return `left: 7px;
    top: -2px;`
  }
}}
  white-space: nowrap;
  font-size: 11px;
`
export const CircleHandle = styled(Handle)<{ rotation: 0 | 1 | 2 | 3 }>`
display: grid;
place-items: center;
width: 2px;
height: 2px;
background-color: black;
border: none;
min-width: 0;
min-height: 0;
position: relative;
right: auto !important;
bottom: auto !important;

${({ rotation }) => {
  switch (rotation) {
    case 0: return `top: 8.5px;
    left: -2px;`
    case 1: return `top: 6px;
    left: 0.5px;`
    case 2: return `top: 8.5px;
    left: 1px;`
    case 3: return `top: 9px;
    left: 0.5px;`
  }
}}

&:before {
  content: url('icons/sockets/socket_only.png');
  opacity: 1;
  position: relative;

  ${({ rotation }) => {
    switch (rotation) {
      case 0: return `left: -3px;
      bottom: 4.5px;`
      case 1: return `bottom: 3px;
      left: -4.5px;`
      case 2: return `bottom: 4.5px;
      left: -6px;`
      case 3: return `top: -6px;
      left: -4.5px;`
    }
  }}
}
`