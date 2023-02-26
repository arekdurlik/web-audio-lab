import { useEffect, useState, FC, MouseEvent } from 'react'
import { Delete, Expand, HoverOptions, LeftOptions, NodeContainer, NodeTitle, Parameters, Rotate } from './styled'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { getEdgeIndex, positions } from '../utils'
import { useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { NodeProps } from './types'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { TriangleHandle } from '../../handles/TriangleHandle'
import { LineHandle } from '../../handles/LineHandle'
import styled from 'styled-components'
import { useUpdateFlowNode } from '../../../hooks/useUpdateFlowNode'

export const Node: FC<NodeProps> = function({ 
  id, 
  name, 
  width = 6,
  height = 3,
  data, 
  sockets, 
  children,
  parameters, 
  value,
  parameterPositions = ['bottom', 'right', 'bottom', 'right'],
  disableRemoval,
  disableBackground,
  disableBorder,
  onRotate
}) {
  const [rotation, setRotation] = useState<0 | 1 | 2 | 3>(data.rotation ?? 0)
  const [active, setActive] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const reactFlowInstance = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const { updateNode, deleteNode } = useUpdateFlowNode(id)
  const activator = useOutsideClick(() => setActive(false))
  const gridSize = 16
  const mulWidth = width * gridSize
  const mulHeight = height * gridSize

  useEffect(() => {
    updateNode({ rotation })
    if (typeof onRotate === 'function') onRotate(rotation)
  }, [rotation])

  function handleRotate(event: MouseEvent) {
    event.stopPropagation()
    setRotation(state => (state + 1) % 4 as any)
    updateNodeInternals(id)
  }

  function handleExpand(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    setExpanded(!expanded)
  }

  const handles = sockets.map((socket, i) => {
    const props = {
      key: i,
      id: socket.id,
      label: socket.label,
      type: socket.type,
      position: positions[rotation][getEdgeIndex(socket.edge)],
      offset: socket.offset,
    }
    switch (socket.visual) {
      case 'circle': return <LineHandle {...props} disableColor alwaysVisible />
      case 'triangle': return <TriangleHandle {...props} />
      default: return <LineHandle {...props} />
    }
  })

  return (
    <div
      onPointerOver={() => setActive(true)}
      onPointerOut={() => {if (!expanded) setActive(false)}} 
      ref={activator}
    >
      <NodeContainer 
        width={rotation === 0 || rotation === 2 ? mulWidth : mulHeight} 
        height={rotation === 0 || rotation === 2 ? mulHeight : mulWidth}
        disableBackground={disableBackground}
        disableBorder={disableBorder}
      >
        {active && <HoverOptions>
          <LeftOptions>
            {parameters && <Expand onClick={handleExpand}>
              {expanded ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
            </Expand>}
            <Rotate onClick={handleRotate} />
          </LeftOptions>
          {!disableRemoval && <Delete onClick={deleteNode}/>}
        </HoverOptions>}
        {handles}
        <NodeTitle rotation={rotation}>{name}</NodeTitle>
        <Value>{Number.isNaN(value) ? String(value) : value}</Value>
        {children}
      </NodeContainer>
      {expanded && <Parameters 
        rotation={rotation}
        positions={parameterPositions}
        onClick={(e) => e.stopPropagation()}
      >
        {parameters}
      </Parameters>}
    </div>
  )
}

const Value = styled.div`
position: absolute;
bottom: 0;
left: 0;
padding: 1px 3px;
font-size: 12px;
width: 100%;
`