import styled, { createGlobalStyle } from 'styled-components'
import { outsetBorder } from './98'

export const GlobalStyle = createGlobalStyle<{ editMode?: boolean }>`

.outset-border {
  ${outsetBorder}
}

* {
  font-family: 'Pixelated MS Sans Serif', sans-serif;
  font-size: 11px;
  image-rendering: pixelated;
  shape-rendering: optimizeSpeed;
  box-sizing: border-box;
}

body {
  margin: 0;
}

textarea {
  box-shadow: none;
  overflow: hidden;
}

/* .react-flow__node > div > div {
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(255,0,0,0.2);
    mix-blend-mode: darken;
    z-index: 4;
  }
} */

.react-flow {
  &__background {
    transform: translate(0.5px, 0.5px);
  }
  &__edge {
    z-index: 1000 !important;
    &.updating,
    &.selected {
      path {
        stroke-width: 2 !important;
      }
    }

    &-default {
      opacity: 0;
    }

    &.updating > path {
      stroke-width: 1 !important ;
    }

    ${({ editMode }) => !editMode && 'pointer-events: none !important;'}
  }

  &__edgeupdater {
    ${({ editMode }) => !editMode && 'pointer-events: none !important;'}
  }

  &__minimap {
    
    ${outsetBorder}
  }

  &__controls-button {
    border: 1px solid #000;

    &:not(:first-child) {
      border-top: none;
    }
  }
}

/* .selected > div > div:first-child {
  ::before {
    content: '';
    pointer-events: none;
    position: absolute;
    inset: 0;
    background-color: rgba(154, 203, 230, 0.25);
    z-index: 999;
    border: 1px solid rgb(154, 203, 230);
  }
} */
`
export const FlowWrapper = styled.div`
background-image: url('clouds.jpg');
background-size: cover;
position: relative;
width: 100%;
// 100% - navbar height
height: calc(100% - 47px);
`

export const Fullscreen = styled.div`
height: 100vh;
overflow: hidden;
`

export const FlexContainer = styled.div<{ direction?: string, justify?: string, align?: string, gap?: string | number, width?: string }>`
  display: flex;
  ${({ width }) => width !== undefined && `width: ${width};`}
  ${({ direction }) => direction && `flex-direction: ${direction};`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ align }) => align && `align-items: ${align};`}
  ${({ gap }) => gap !== undefined && `gap: ${gap}px;`}
`

export const Hr = styled.div`
width: 100%;
height: 2px;
box-shadow: inset -1px -1px #ffffff, inset 1px 1px #808080;
`