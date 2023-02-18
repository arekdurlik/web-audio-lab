import { GiClockwiseRotation } from 'react-icons/gi'
import { RiDeleteBin2Line } from 'react-icons/ri'
import styled from 'styled-components'

export const NodeTitle = styled.span<{ rotation?: 0 | 1 | 2 | 3 }>`
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 100%;
  flex: 1;
  white-space: nowrap;

  ${({ rotation }) => {
    switch(rotation) {
      case 1:
      case 3: return 'rotate: -90deg;'
    }
  }}
`

export const NodeContainer = styled.div<{ width?: number, height?: number }>`
  position: relative;
  box-sizing: border-box;
  background-color: white;
  padding: 5px;
  box-shadow: inset 0px 0px 0px 1px #000;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  
  ${({ width }) => `min-width: ${width ? width : '120'}px;`}
  ${({ height }) => `min-height: ${height ? height : '60'}px;`}
  
  .react-flow__handle {
    border-color: #000;
    
    &.target {
      background-color: #fff;
    }

  }
`

/**
 * @param rotation - rotation of the node
 * @param positions - placement of the parameters window for each rotation
 */
export const Parameters = styled.div<{ 
  rotation?: 0 | 1 | 2 | 3, 
  positions?: ('left' | 'top' | 'right' | 'bottom')[] 
}>
`
font-size: 12px;
background-color: #fff;
border: 1px solid #000;
padding: 5px;
z-index: 4;

${({ rotation = 0, positions = ['bottom', 'right', 'bottom', 'right'] }) => {
  switch(positions[rotation]) {
    case 'bottom': return `
      position: absolute;
      top: calc(100% - 1px);`
    case 'right': return `
      position: absolute;
      top: 0;
      left: calc(100% - 1px);`
    case 'top': return `
      position: absolute;
      bottom: calc(100% - 1px);`
    case 'left': return `
      position: absolute;
      top: 0;
      right: calc(100% - 1px);`
}
}}
`

export const Parameter = styled.div`
display: flex;
gap: 5px;
`

export const Expand = styled.div`
display: flex;
svg {
  cursor: pointer;
}
`

export const Delete = styled(RiDeleteBin2Line)`
cursor: pointer;
`
export const Rotate = styled(GiClockwiseRotation)`
cursor: pointer;
`

export const LeftOptions = styled.div`
display: flex;
gap: 1px;
`

export const HoverOptions = styled.div`
box-sizing: border-box;
position: absolute;
top: 4px;
padding-bottom: 15px;
left: 4px;
width: calc(100% - 8px);
display: flex;
justify-content: space-between;
z-index: 1;

& > div {
  display: flex;
}

svg {
  font-size: 12px;
}
`