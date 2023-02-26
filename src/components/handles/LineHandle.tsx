import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import { Label } from './styled'

type HandleProps = {
  id: string
  label?: string
  type: 'target' | 'source'
  position: Position
  offset: number
  alwaysVisible?: boolean
  disableColor?: boolean
}

export function LineHandle({ id, label, type, position, offset = 20, alwaysVisible, disableColor }: HandleProps) {
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
    <StyledLineHandle
      id={id}
      type={type}
      direction={direction}
      position={position}
      offset={offset}
      $disableColor={disableColor}
      $alwaysVisible={alwaysVisible}
    >
      <Label position={position}>
        {label}
      </Label>
    </StyledLineHandle>
  )
}



export const StyledLineHandle = styled(Handle)<{ 
  direction: 'right' | 'bottom' | 'left' | 'top', 
  type?: 'source' | 'target', 
  offset: number 
  $alwaysVisible?: boolean
  $disableColor?: boolean
}>`
display: grid;
place-items: center;
border: none;
background: none !important;
border-radius: 0;
min-width: 0;
min-height: 0;
width: 1px;
height: 1px;
z-index: 3;
&.target {
  &:before {
    ${({ $alwaysVisible }) => $alwaysVisible ? 'opacity: 1;' : 'opacity: 0;'}
    ${({ $disableColor }) => $disableColor ? `
      background-color: #fff;
      box-shadow: 0px 0px 0px 1px #000;
      ` : 'background-color: #090;'
    }
  }
}
&.source {
  &:before {
    ${({ $alwaysVisible }) => $alwaysVisible ? 'opacity: 1;' : 'opacity: 0;'}
    ${({ $disableColor }) => $disableColor ? `
      background-color: #fff;
      box-shadow: 0px 0px 0px 1px #000;
    ` : 'background-color: #c00;'}
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
      bottom: ${offset - 1}px;
    `
    case Position.Bottom: return `
      right: auto;
      left: ${offset}px;
    `

    case Position.Top: return `
      left: auto;
      right: ${offset - 1}px;
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
  height: 7px !important;
  width: 7px !important; 
  border-radius: 100%;

  ${({ position }) => {
  switch(position) {
    case Position.Left: return `
      top: -3px;
      left: -4px;
    `
    case Position.Right: return `
      left: -2px;
      top: -3px;
    `
    case Position.Bottom: return `
    left: -3px;
    top: -2px;
    `
    case Position.Top: return `
      left: -3px;
      top: -4px;
    `
  }
}}

  

  ${({ direction, type }) => type === 'target' 
  ? `${direction}: -2px;`
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