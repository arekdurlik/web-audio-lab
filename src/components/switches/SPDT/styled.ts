import styled from 'styled-components'
import up from '/svg/up.svg'
import SVG from "react-inlinesvg"

export const ConnectionWrapper = styled.div<{ state?: 'A' | 'B', rotation?: 0 | 1 | 2 | 3 | undefined }>`
position: absolute;

cursor: pointer;
z-index: 1;
padding: 5px;

${({ state, rotation }) => {
    switch (rotation) {
      case 1:
        return state === 'A' ? `
          transform: rotate(90deg);
          left: -12px; 
          top: 16px;
        ` : `
          transform: rotate(90deg);
          left: -1.5px;
          top: 11.5px;
      `
      case 2:
        return state === 'A' ? `
          top: 11px; 
          left: -6px;
          width: 100%;
          height: 2px;
        ` : `
          top: 10px;
          left: 0;
          transform: rotate(180deg);
        `
      case 3:
        return state === 'A' ? `
          transform: rotate(-90deg);
          left: 4px;
          top: 20px;
        ` : `
          left: 1.5px;
          top: 11.5px;
          transform: rotate(-90deg);
      `
      default:
        return state === 'A' ? `
          top: 27px; 
          left: 0px;
          width: 100%;
          height: 1px;
        ` : `
          top: 13px; 
          left: 0px; 
          width: 100%;
          height: 1px;
        `
      
    }
  }}
`
export const ConnectionLine = styled.div`
width: 47px;
height: 1px;
background-color: #000;
`
