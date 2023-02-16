import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

* {
  font-family: 'Arial', sans-serif;
  image-rendering: pixelated;
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

export const Fullscreen = styled.div`
position: absolute;
inset: 0;
`

export const FlexContainer = styled.div<{ direction?: string, justify?: string, align?: string, gap?: string | number }>`
  display: flex;
  ${({ direction }) => direction && `flex-direction: ${direction};`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ align }) => align && `align-items: ${align};`}
  ${({ gap }) => gap && `gap: ${gap}px;`}
`