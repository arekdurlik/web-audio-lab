import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import { Label } from './styled'
import {GoTriangleRight } from 'react-icons/go'
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
      <Triangle direction={direction} />
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
      bottom: ${offset - 2}px;
    `
    case Position.Right: return `
    bottom: auto;
      top: ${offset}px;
    `
    case Position.Bottom: return `
      left: auto;
      right: ${offset - 2}px;
    `
    case Position.Top: return `
      right: auto;
      left: ${offset}px;
    `
  }
}}

${({ position, type }) => type === 'target' 
  ? `${position}: 3px;` 
  : `${position}: 3px;`
}
`

const Triangle = styled(GoTriangleRight)<{ direction: 'right' | 'bottom' | 'left' | 'top' }>`
position: absolute;
top: -4px;
font-size: 15px;
fill: #fff;
stroke: #000;
stroke-width: 1px;
${({ direction }) => {
  switch(direction) {
    case 'bottom': return `
    transform: rotate(90deg);
    top: -7px;`
    case 'left': return `
    transform: rotate(180deg);
    left: -6px;
    top: -7px;`
    case 'top': return `
    transform: rotate(-90deg);
    top: -6px;`
    case 'right': return `
    left: -7px;
    top: -7px;`
  }
}}
`