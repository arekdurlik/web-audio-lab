import styled from 'styled-components'

export const ConnectionWrapper = styled.div<{ state?: 'A' | 'B', rotation?: 0 | 1 | 2 | 3 | undefined }>`
position: absolute;

cursor: pointer;
z-index: 1;
padding: 5px;

${({ state, rotation }) => {
    switch (rotation) {
      case 1:
        return state === 'A' ? `
          width: 2px;
          height: 100%;
          top: -7px;
          left: 26px; 
        ` : `
          width: 2px;
          height: 100%;
          top: -8px;
          left: 33px; 
          transform: rotate(-19deg);
      `
      case 2:
        return state === 'A' ? `
          top: 26px; 
          left: -6px;
          width: 100%;
          height: 2px;
        ` : `
          top: 34px; 
          left: -6px; 
          width: 100%;
          height: 2px;
          transform: rotate(-20deg);
        `
      case 3:
        return state === 'A' ? `
          width: 2px;
          height: 100%;
          top: -3px;
          left: 26px; 
        ` : `
          width: 2px;
          height: 100%;
          top: -2px;
          left: 19px; 
          transform: rotate(-19deg);
      `
      default:
        return state === 'A' ? `
          top: 26px; left: -6px;
          width: 100%;
          height: 2px;
        ` : `
          top: 18px; left: -6px; transform: rotate(-20deg);
          width: 100%;
          height: 2px;
        `
      
    }
  }}
`
export const ConnectionLine = styled.div`
width: 100%;
height: 100%;
background-color: #000;
`