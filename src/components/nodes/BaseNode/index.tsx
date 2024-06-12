import { useEffect, useState, FC, MouseEvent } from 'react'
import { Expand, HoverOptions, LeftOptions, NodeContainer, NodeTitle, Parameters } from './styled'
import { getEdgeIndex, positions } from '../utils'
import { useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { NodeProps } from './types'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { ParamHandle } from '../../handles/ParamHandle'
import { LineHandle } from '../../handles/LineHandle'
import styled from 'styled-components'
import { useUpdateFlowNode } from '../../../hooks/useUpdateFlowNode'
import NodeDelete from '/svg/node_delete.svg'
import NodeRotate from '/svg/node_rotate.svg'
import NodeExpand from '/svg/node_expand.svg'
import SVG from 'react-inlinesvg'
import { useFlowStore } from '../../../stores/flowStore'
import { Tooltip } from '../../ui/Tooltip'

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
  parameterOffset = 0,
  parametersWidth,
  startExpanded = false,
  disableRemoval,
  disableBackground,
  disableBorder,
  borderColor = '#000',
  background,
  optionsColor,
  valueFont,
  valueColor,
  valueUnit,
  constantSize,
  optionsStyle,
  labelPosition,
  onRotate
}) {
  const [rotation, setRotation] = useState<0 | 1 | 2 | 3>(data.rotation ?? 0)
  const [active, setActive] = useState(false)
  const [expanded, setExpanded] = useState(startExpanded)
  const updateNodeInternals = useUpdateNodeInternals()
  const { updateNode, deleteNode } = useUpdateFlowNode(id)
  const activator = useOutsideClick(() => setActive(false))
  const { editMode } = useFlowStore()
  const gridSize = 16
  const mulWidth = width * gridSize + 1
  const mulHeight = height * gridSize + 1

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
      offset: socket.offset instanceof Array ? socket.offset[rotation] + 0.5 : socket.offset + 0.5,
      tooltip: socket.tooltip
    }
    switch (socket.visual) {
      case 'circle': return <LineHandle {...props} alwaysVisible color={active} />
      case 'param': return <ParamHandle {...props} />
      default: return <LineHandle {...props} color />
    }
  })

  return (
    <div
      onPointerOver={() => setActive(true)}
      onPointerOut={() => {if (!expanded) setActive(false)}} 
      ref={activator}
    >
      <NodeContainer 
        width={rotation === 0 || rotation === 2 || constantSize ? mulWidth : mulHeight} 
        height={rotation === 0 || rotation === 2 || constantSize ? mulHeight : mulWidth}
        disableBackground={disableBackground}
        disableBorder={disableBorder}
        active={expanded}
      >
        {background && <Background disableBorder={disableBorder} borderColor={borderColor}>{background}</Background>}
        {active && <HoverOptions color={optionsColor} style={optionsStyle}>
          <LeftOptions>
            {parameters && <Tooltip delay={1000} content={`${expanded ? 'Hide' : 'Show'} parameters`}>
              <Expand onClick={handleExpand}>
                <Option src={NodeExpand} width={8} height={8} $rotate={!expanded} /> 
              </Expand>
            </Tooltip>}
            {editMode && <Option title='Rotate node' src={NodeRotate} onClick={handleRotate}  width={8} height={8}/>}
          </LeftOptions>
          {(!disableRemoval && editMode) && <Option title='Delete node' src={NodeDelete} width={8} height={8} onClick={deleteNode}/>}
        </HoverOptions>}
        {handles}
        <NodeTitle position={labelPosition} rotation={rotation}>{name}</NodeTitle>
        <Value 
          color={valueColor}
          font={valueFont}
        >
          {Number.isNaN(value) ? String(value) : value}{valueUnit}
        </Value>
        {children}
      </NodeContainer>
      {expanded && <Parameters 
        rotation={rotation}
        positions={parameterPositions}
        offset={parameterOffset}
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: parametersWidth }}
      >
        {parameters}
      </Parameters>}
    </div>
  )
}

const Value = styled.div<{ color?: string, font?: string }>`
position: absolute;
bottom: 0;
left: 0;
padding: 1px 3px;
font-size: 11px;
width: 100%;

${({ color }) => color && `color: ${color};`}
${({ font }) => font && `font-family: '${font}';`}
`
const Background = styled.div<{ disableBorder?: boolean, borderColor: string }>`
position: absolute;
inset: 0;
${({ disableBorder, borderColor }) => !disableBorder && `border: 1px ${borderColor} solid;`}
`

export const Option = styled(SVG)<{ $rotate?: boolean }>`
&:hover {
  cursor: pointer;
  color: #999;
}

${({ $rotate }) => $rotate && 'transform: rotate(180deg);'}
`
