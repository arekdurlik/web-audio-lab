import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import { useFlowStore } from '../../stores/flowStore'
import { Tooltip } from '../ui/Tooltip'

type HandleProps = {
  id: string
  label?: string
  type: 'target' | 'source'
  position: Position
  offset: number
  alwaysVisible?: boolean
  disableColor?: boolean
  color?: boolean
  tooltip?: string
}

export function LineHandle({ id, label, type, position, offset = 20, alwaysVisible, color, tooltip }: HandleProps) {
  const editMode = useFlowStore(state => state.editMode)
  const zoom = useFlowStore(state => state.zoom)

  const direction = (function getDirection() {
    switch(position) {
      case Position.Left:
        if (type === 'target') return 'right'
        else return 'left'
      case Position.Top:
        if (type === 'target') return 'bottom'
        else return 'top'
      case Position.Right:
        if (type === 'target') return 'left'
        else return 'right'
        case Position.Bottom:
          if (type === 'target') return 'top'
          else return 'bottom'
    }
  })()
  
  const Handle = <StyledLineHandle
    id={id}
    type={type}
    direction={direction}
    position={position}
    offset={offset}
    $color={color}
    $alwaysVisible={alwaysVisible}
    $visible={editMode}
  >
    <Label position={position}>
      {label}
    </Label>
  </StyledLineHandle>

  return <>
    {tooltip ? <Tooltip zoom={zoom} content={tooltip}>{Handle}</Tooltip> : Handle}
  </>
}



export const StyledLineHandle = styled(Handle)<{ 
  direction: 'right' | 'bottom' | 'left' | 'top', 
  type?: 'source' | 'target', 
  offset: number 
  $alwaysVisible?: boolean
  $color?: boolean
  $visible?: boolean
}>`
display: grid;
place-items: center;
border: none;
background: none !important;
border-radius: 0;
min-width: 0;
min-height: 0;
width: 2px;
height: 2px;
z-index: 3;

${({ $visible }) => !$visible && `
  pointer-events: none !important;
`}

&.target {
  &:before {
    ${({ $alwaysVisible }) => $alwaysVisible ? 'opacity: 1;' : 'opacity: 0;'}
  }
}
&.source {
  &:before {
    ${({ $alwaysVisible }) => $alwaysVisible ? 'opacity: 1;' : 'opacity: 0;'}
  }
}

${({ position, offset }) => {
  switch(position) {
    case Position.Left: return `
      bottom: auto;
      top: ${offset}px;
    `
    case Position.Right: return `
      top: auto;
      bottom: ${offset - 2}px;
    `
    case Position.Bottom: return `
      right: auto;
      left: ${offset}px;
    `

    case Position.Top: return `
      left: auto;
      right: ${offset - 2}px;
    `
  }
}}

${({ position, type }) => type === 'target' 
  ? `${position}: 1px;` 
  : `${position}: 1px;`
}

&:before {
  content: '';
  position: relative;
  display: grid;
  place-items: center;
  width: 1px;
  height: 1px;
  background-color: transparent;
  border-radius: 100%;

  ${({ position }) => {
    switch(position) {
      case Position.Left: return `
        top: -5px;
        left: -5.5px;
      `
      case Position.Right: return `
        left: -2.5px;
        top: -5px;
      `
      case Position.Bottom: return `
      left: -4px;
      top: -3.5px;
      `
      case Position.Top: return `
        left: -4px;
        top: -6.5px;
      `
    }
  }}

}

&.source {
  &:before {
    content: url('icons/sockets/source.png');
    ${({ $color }) => {
      return !$color && `filter: saturate(0) brightness(10);`
    }}
    
  }
}
&.target {
  &:before {
    content: url('icons/sockets/target.png');
    ${({ $color }) => !$color && `filter: saturate(0) brightness(10);`}
  }
}
`

const Label = styled.span<{ position: Position }>`
position: absolute;
font-size: 11px;

${({ position }) => {
  switch (position) {
    case Position.Right: return `right: 1px;
    bottom: -4px;`
    case Position.Bottom: return `
    rotate: -90deg;
    bottom: 6.5px;
    left: -7px`
    case Position.Left: return `left: 2px;
    bottom: -4px`
    case Position.Top: return `top: -2px;
    left: 8px`
  }
}}
`