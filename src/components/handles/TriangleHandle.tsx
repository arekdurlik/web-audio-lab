import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import { Label } from './styled'

type HandleProps = {
  id: string
  label?: string
  type: 'target' | 'source'
  position: Position
  offset: number
}

export function TriangleHandle({ id, label, type, position, offset = 20 }: HandleProps) {
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
  
  return (
    <StyledHandle
      id={id}
      type={type}
      direction={direction}
      position={position}
      offset={offset}
    >
      <Label position={position}>
        {label}
      </Label>
    </StyledHandle>
  )
}

const StyledHandle = styled(Handle)<{ 
  direction: 'right' | 'bottom' | 'left' | 'top', 
  type?: 'source' | 'target', 
  offset: number 
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

${({ position, offset }) => {
  switch(position) {
    case Position.Left: return `
    top: auto;
      bottom: ${offset}px;
    `
    case Position.Right: return `
    bottom: auto;
      top: ${offset}px;
    `
    case Position.Bottom: return `
      left: auto;
      right: ${offset}px;
    `

    case Position.Top: return `
      right: auto;
      left: ${offset}px;
    `
  }
}}

${({ position, type }) => type === 'target' 
  ? `${position}: 0px;` 
  : `${position}: -1px;`
}

&:before {
  content: '';
  border-top: 5px solid transparent !important;
  border-bottom: 5px solid transparent !important;
  border-left: 8px solid #000 !important;
  position: absolute;

  ${({ direction, type }) => type === 'target' 
  ? `${direction}: -7px;`
  : '' }

  ${({ direction }) => direction === 'bottom' 
  ? 'transform: rotate(90deg);' 
  : direction === 'left'
  ? 'transform: rotate(180deg);'
  : direction === 'top'
  ? 'transform: rotate(-90deg);' : ''
  }
}
`