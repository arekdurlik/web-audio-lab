import { useEffect, useState, FC, ReactNode } from 'react'
import { Delete, Expand, HoverOptions, LeftOptions, NodeContainer, NodeTitle, Parameters, Rotate } from './styled'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { positions } from '../utils'
import { useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { Edge, NodeProps } from './types'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { TriangleHandle } from '../../handles/TriangleHandle'
import { LineHandle } from '../../handles/LineHandle'

export const Node: FC<NodeProps> = function({ 
  id, 
  name, 
  width = 120,
  height = 60,
  data, 
  sockets, 
  parameters, 
  parameterPositions = ['bottom', 'right', 'bottom', 'right'],
  disableRemoval
}) {
  const [rotation, setRotation] = useState<0 | 1 | 2 | 3>(data.rotation ?? 0)
  const [active, setActive] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const reactFlowInstance = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const activator = useOutsideClick(() => setActive(false))

  useEffect(() => {
    const newNodes = reactFlowInstance.getNodes().map((node) => {
      if (node.id === id) {
        node.data = {
          ...node.data,
          rotation: data.rotation,
        }
      }
      return node
    })
    reactFlowInstance.setNodes(newNodes)
  }, [data.rotation])

  function getEdgeIndex(edge: Edge) {
    switch(edge) {
      case 'left':    return 0
      case 'top':     return 1
      case 'right':   return 2
      case 'bottom':  return 3
    }
  }
  
  function handleDelete() {
    reactFlowInstance.deleteElements({ nodes: [{ id }]})
  }

  function handleRotate() {
    setRotation(state => (state + 1) % 4 as any)
    updateNodeInternals(id)
  }

  const handles = sockets.map((socket, i) => {
    const props = {
      key: i,
      id: socket.id,
      label: socket.label,
      type: socket.type,
      position: positions[rotation][getEdgeIndex(socket.edge)],
      offset: socket.offset
    }
    switch (socket.visual) {
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
        width={rotation === 0 || rotation === 2 ? width : height} 
        height={rotation === 0 || rotation === 2 ? height : width}
      >
        {active && <HoverOptions>
          <LeftOptions>
            {parameters && <Expand onClick={() => setExpanded(!expanded)}>
              {expanded ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
            </Expand>}
            <Rotate onClick={handleRotate} />
          </LeftOptions>
          {!disableRemoval && <Delete onClick={handleDelete}/>}
        </HoverOptions>}
        {handles}
        <NodeTitle rotation={rotation}>{name}</NodeTitle>
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