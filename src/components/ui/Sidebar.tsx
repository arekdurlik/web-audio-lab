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
    }
  ]

  function onDragStart(event: DragEvent, nodeType: string) {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return <Container>
    {options.map((o, i) => <Option key={i} onDragStart={(event) => onDragStart(event, o.id)} draggable>{o.label}</Option>)}
  </Container>
}

const Option = styled.div`
padding: 10px;
`
const Container = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
width: 250px;
z-index: 1000;

background-color: #fff;
border-right: 1px solid #000;
`