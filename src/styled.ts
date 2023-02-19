import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

* {
  font-family: 'Arial', sans-serif;
  image-rendering: pixelated; image-rendering: crisp-edges;
}

.react-flow__minimap-node {
  stroke: #000;
  stroke-width: 5px;
  fill: none;
}

.react-flow__minimap {
  border: 1px solid #000;
}

.react-flow__controls-button {
  border: 1px solid #000;

  &:not(:first-child) {
    border-top: none;
  }
}

.react-flow__edge {
  z-index: 1000 !important;
  &.updating,
  &.selected {
    path {
      stroke-width: 2 !important;
    }
  }
}
`
export const FlowWrapper = styled.div`
position: relative;
width: 100%;
height: 100%;
`

export const Fullscreen = styled.div`
display: flex;
flex-direction: column;
position: absolute;
inset: 0;
height: 100%;
`

export const FlexContainer = styled.div<{ direction?: string, justify?: string, align?: string, gap?: string | number, width?: string }>`
  display: flex;
  ${({ width }) => width !== undefined && `width: ${width};`}
  ${({ direction }) => direction && `flex-direction: ${direction};`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ align }) => align && `align-items: ${align};`}
  ${({ gap }) => gap !== undefined && `gap: ${gap}px;`}
`