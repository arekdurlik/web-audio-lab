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

export function LineHandle({ id, label, type, position, offset = 20 }: HandleProps) {
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
width: 8px;
height: 7px;
z-index: 3;

${({ position, offset }) => {
  switch(position) {
    case Position.Left: return `
      bottom: auto;
      top: ${offset}px;
    `
    case Position.Right: return `
      top: auto;
      bottom: ${offset - 7}px;
    `
    case Position.Bottom: return `
      right: auto;
      left: ${offset}px;
    `

    case Position.Top: return `
      left: auto;
      right: ${offset - 8}px;
    `
  }
}}

${({ position, type }) => type === 'target' 
  ? `${position}: 3px;` 
  : `${position}: 3px;`
}

&:before {
  content: '';
  position: relative;
  display: grid;
  place-items: center;
  width: 4px;
  height: 1px;
  background-color: #bbb;

  ${({ direction, type }) => type === 'target' 
  ? `${direction}: 4px;`
  : `${direction}: -4px;` }

  ${({ direction }) => direction === 'bottom' 
  ? 'transform: rotate(90deg);' 
  : direction === 'left'
  ? 'transform: rotate(180deg);'
  : direction === 'top'
  ? 'transform: rotate(-90deg);' : ''
  }
}
`