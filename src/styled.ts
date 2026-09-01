import styled, { createGlobalStyle } from 'styled-components';
import { button_highlight, button_shadow, outsetBorder, window_frame } from './98';

export const GlobalStyle = createGlobalStyle<{ editMode?: boolean; scale?: string }>`

:root {
  --surface: #c0c0c0;
}

button, input, select, textarea, option {
  color: inherit;
}

::-webkit-scrollbar-track {
  background-image: var(--scrollbar-track-bg);
}

::-webkit-scrollbar-button:vertical:start {
  background-image: var(--scrollbar-btn-up);
}
::-webkit-scrollbar-button:vertical:end {
  background-image: var(--scrollbar-btn-down);
}
::-webkit-scrollbar-button:horizontal:start {
  background-image: var(--scrollbar-btn-left);
}
::-webkit-scrollbar-button:horizontal:end {
  background-image: var(--scrollbar-btn-right);
}

select {
  background-image: var(--scrollbar-btn-down);
}

input[type="range"]::-webkit-slider-thumb {
  background: var(--range-thumb);
}
input[type="range"].has-box-indicator::-webkit-slider-thumb {
  background: var(--range-thumb-box);
}
input[type="range"]::-moz-range-thumb {
  background: var(--range-thumb);
}
input[type="range"].has-box-indicator::-moz-range-thumb {
  background: var(--range-thumb-box);
}

input[type="range"]::-webkit-slider-runnable-track {
  background: ${window_frame};
  border-right: 1px solid ${button_shadow};
  border-bottom: 1px solid ${button_shadow};
  box-shadow: 1px 0 0 ${button_highlight}, 1px 1px 0 ${button_highlight}, 0 1px 0 ${button_highlight},
    -1px 0 0 ${window_frame}, -1px -1px 0 ${window_frame}, 0 -1px 0 ${window_frame},
    -1px 1px 0 ${button_highlight}, 1px -1px ${window_frame};
}
input[type="range"]::-moz-range-track {
  background: ${window_frame};
  border-right: 1px solid ${button_shadow};
  border-bottom: 1px solid ${button_shadow};
  box-shadow: 1px 0 0 ${button_highlight}, 1px 1px 0 ${button_highlight}, 0 1px 0 ${button_highlight},
    -1px 0 0 ${window_frame}, -1px -1px 0 ${window_frame}, 0 -1px 0 ${window_frame},
    -1px 1px 0 ${button_highlight}, 1px -1px ${window_frame};
}

.is-vertical > input[type="range"]::-webkit-slider-runnable-track {
  border-left: 1px solid ${button_shadow};
  border-right: 0;
  border-bottom: 1px solid ${button_shadow};
  box-shadow: -1px 0 0 ${button_highlight}, -1px 1px 0 ${button_highlight}, 0 1px 0 ${button_highlight},
    1px 0 0 ${window_frame}, 1px -1px 0 ${window_frame}, 0 -1px 0 ${window_frame},
    1px 1px 0 ${button_highlight}, -1px -1px ${window_frame};
}
.is-vertical > input[type="range"]::-moz-range-track {
  border-left: 1px solid ${button_shadow};
  border-right: 0;
  border-bottom: 1px solid ${button_shadow};
  box-shadow: -1px 0 0 ${button_highlight}, -1px 1px 0 ${button_highlight}, 0 1px 0 ${button_highlight},
    1px 0 0 ${window_frame}, 1px -1px 0 ${window_frame}, 0 -1px 0 ${window_frame},
    1px 1px 0 ${button_highlight}, -1px -1px ${window_frame};
}

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

.react-flow__node-default {
  display: none;
}


.underline {
  text-decoration: underline;
}

option {
  ${({ scale }) => `zoom: ${scale};`}
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
    border: 1px solid ${window_frame};

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
`;
export const FlowWrapper = styled.div`
    background-image: url('clouds.jpg');
    background-size: cover;
    position: relative;
    width: 100%;
    height: 100%;
`;

export const Fullscreen = styled.div`
    height: 100vh;
    overflow: hidden;
`;

export const FlexContainer = styled.div<{
    direction?: string;
    justify?: string;
    align?: string;
    gap?: string | number;
    width?: string;
}>`
    display: flex;
    ${({ width }) => width !== undefined && `width: ${width};`}
    ${({ direction }) => direction && `flex-direction: ${direction};`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ align }) => align && `align-items: ${align};`}
  ${({ gap }) => gap !== undefined && `gap: ${gap}px;`}
`;
