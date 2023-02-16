import { Position } from 'reactflow'
import styled from 'styled-components'

export const Label = styled.span<{ position: Position }>`
position: absolute;
font-size: 12px;

${({ position }) => {
  switch (position) {
    case Position.Right: return `right: -14px;
    bottom: 5px;`
    case Position.Bottom: return `bottom: -14px;
    left: 8px`
    case Position.Left: return `left: -14px;
    bottom: 5px`
    case Position.Top: return `top: -14px;
    left: 8px`
  }
}}
`