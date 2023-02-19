import { DragEvent } from 'react'
import styled from 'styled-components'

export function Sidebar() {
  const options = [{
      id: 'gainNode',
      label: 'GainNode'
    },
    {
      id: 'delayNode',
      label: 'DelayNode'
    },
    {
      id: 'filterNode',
      label: 'BiquadFilterNode'
    },
    {
      id: 'oscillatorNode',
      label: 'OscillatorNode'
    },
    {
      id: 'constantSourceNode',
      label: 'ConstantSourceNode'
    },
    {
      id: 'stereoPannerNode',
      label: 'StereoPannerNode'
    }
  ]

  function onDragStart(event: DragEvent, nodeType: string) {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    const preview = document.createElement('div')
    preview.style.display = 'none'
    event.dataTransfer.setDragImage(preview, 0, 0)
  }

  return <Container>
    {options.map((o, i) => 
      <Option 
        key={i} 
        onDragStart={(event) => onDragStart(event, o.id)} 
        draggable
      >
        {o.label}
      </Option>
    )}
  </Container>
}

const Option = styled.div`
padding: 10px;
border: 3px outset;

background-color: #d7d5cf;

&:hover {
  background-color: #c8c6c0; 
}
`
const Container = styled.div`

position: absolute;
top: 0;
bottom: 0;
left: 0;
background-color: #d7d5cf;
z-index: 1000;
border-right: 1px solid #000;
`