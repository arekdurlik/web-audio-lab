import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import { Label } from './styled'
import param from '/svg/param.svg'
import SVG from 'react-inlinesvg'
import { Tooltip } from '../ui/Tooltip'

type HandleProps = {
  id: string
  label?: string
  type: 'target' | 'source'
  position: Position
  offset: number
  tooltip?: string
}

export function ParamHandle({ id, label, type, position, offset = 20, tooltip }: HandleProps) {
  const direction = (function() {
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

  const points = (function() {
    switch(direction) {
      case 'left': return   '0.5,5.5  7,-1  7,11'
      case 'top': return    '5.5,0.5  -1,7  11,7'
      case 'right': return  '1,0      1,10  6.5,5.5'
      case 'bottom': return '5,6  0,1   10,1'
    }
  })()

  const Handle = <StyledHandle
      id={id}
      type={type}
      direction={direction}
      position={position}
      offset={offset}
    >
      <Triangle direction={direction} src={param}>
      </Triangle>
      <Label position={position}>
        {label}
      </Label>
    </StyledHandle>

  return <>
    {tooltip ? <Tooltip content={tooltip}>{Handle}</Tooltip> : Handle}
  </>
}

const Triangle = styled(SVG)<{ direction: 'right' | 'bottom' | 'left' | 'top' }>`
position: absolute;
top: -3px;
font-size: 15px;
width: 12px;
height: 6px;
fill: #fff;
stroke: #000;
stroke-width: 1px;

${({ direction }) => {
  switch(direction) {
    case 'bottom': return `
    top: 0px;
    `
    case 'left': return `
    transform: rotate(90deg);
    left: -7.5px;
    top: -2px;`
    case 'top': return `
    transform: rotate(180deg);
    top: -4px;`
    case 'right': return `
    transform: rotate(-90deg);
    left: -3.5px;
    top: -2px;`
  }
}}
`

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

${({ position, type }) => `${position}: 1px;`}
`