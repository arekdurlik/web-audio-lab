import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
body, html, * {
  font-family: 'Arial';
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
`

export const Fullscreen = styled.div`
position: absolute;
inset: 0;
`