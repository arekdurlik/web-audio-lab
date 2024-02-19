import { useState, DragEvent } from 'react'
import styled from 'styled-components'

export function Sidebar() {
  const [options, setOptions] = useState([{
    title: 'Base nodes',
    active: true,
    items: [
      {
        id: 'gainNode',
        label: 'GainNode'
      },
      {
        id: 'delayNode',
        label: 'DelayNode'
      },
      {
        id: 'convolverNode',
        label: 'ConvolverNode'
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
        id: 'audioBufferSourceNode',
        label: 'AudioBufferSourceNode'
      },
      {
        id: 'stereoPannerNode',
        label: 'StereoPannerNode'
      },
      {
        id: 'waveShaperNode',
        label: 'WaveShaperNode'
      },
      {
        id: 'analyserNode',
        label: 'AnalyserNode'
      }
    ]
  }, {
    title: 'AudioWorklet nodes',
    active: false,
    items: [
      {
        id: 'bitcrusher',
        label: 'Bitcrusher'
      },
    ]
  }, {
    title: 'Switches',
    active: false,
    items: [
      {
        id: 'spdtFork',
        label: 'SPDT Fork'
      },
      {
        id: 'spdtJoin',
        label: 'SPDT Join'
      },
    ]
  }, {
    title: 'Utils',
    active: false,
    items: [
      {
        id: 'note',
        label: 'Note'
      },
      {
        id: 'text',
        label: 'Text'
      }
    ]
  }
  ])

  function handleTabClick(index: number) {
    const newOptions = options.slice()
    newOptions[index].active = !newOptions[index].active

    setOptions(newOptions)
  }

  function onDragStart(event: DragEvent, nodeType: string) {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    const preview = document.createElement('div')
    preview.style.display = 'none'
    event.dataTransfer.setDragImage(preview, 0, 0)
  }

  return <Container>
    {options.map((o, i) => <div key={i}>
      <Tab active={options[i].active} onClick={(() => handleTabClick(i))}>{o.title}</Tab>
      <Options active={options[i].active}>
      {o.items.map((item, j) => <Option 
        key={j} 
        onDragStart={(event) => onDragStart(event, item.id)} 
        draggable
      >
        {item.label}
      </Option>)}
      </Options>
    </div>
    )}
  </Container>
}

const Tab = styled.div<{ active: boolean }>`
user-select: none;
display: flex;
align-items: center;
padding: 5px 10px;
border: 3px outset;
font-weight: bold;
gap: 5px;

&:before {
  content: '';
  width: 0; 
  height: 0; 
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;

  border-left: 7px solid black;
}

&:hover {
  background-color: #c8c6c0; 
  cursor: pointer;
}

${({ active }) => active && `
  background-color: #bebbb2;
  &:before {
    transform: rotate(90deg);
  }
`}
`

const Options = styled.div<{ active: boolean }>`
overflow: hidden;
height: 0;
${({ active }) => active && `height: auto;`}
`
const Option = styled.div`
padding: 10px 20px 10px 20px;
border: 3px outset;

background-color: #d7d5cf;

&:hover {
  background-color: #c8c6c0; 
  cursor: grab;
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