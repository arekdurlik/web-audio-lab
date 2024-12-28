import { useState, DragEvent } from 'react'
import styled from 'styled-components'
import triangle from '/svg/triangle.svg'
import SVG from 'react-inlinesvg'
import { outsetBorder, surface } from '../../98'
import { useSettingsStore } from '../../stores/settingsStore'
import { headerHeight } from './MenuBar';
export function Sidebar() {
  const [options, setOptions] = useState([{
    title: 'Base nodes',
    active: true,
    items: [
      {
        id: 'gainNode',
        label: 'Gain'
      },
      {
        id: 'delayNode',
        label: 'Delay'
      },
      {
        id: 'convolverNode',
        label: 'Convolver'
      },
      {
        id: 'filterNode',
        label: 'Biquad filter'
      },
      {
        id: 'oscillatorNode',
        label: 'Oscillator'
      },
      {
        id: 'constantSourceNode',
        label: 'Constant source'
      },
      {
        id: 'audioBufferSourceNode',
        label: 'Audio buffer source'
      },
      {
        id: 'stereoPannerNode',
        label: 'Stereo panner'
      },
      {
        id: 'waveShaperNode',
        label: 'Wave shaper'
      },
      {
        id: 'analyserNode',
        label: 'Analyser'
      },
      {
        id: 'liveInput',
        label: 'Live Input'
      },
      {
        id: 'destination',
        label: 'Output'
      },
    ]
  }, {
    title: 'Custom nodes',
    active: false,
    items: [
      {
        id: 'bitcrusher',
        label: 'Bitcrusher'
      },
      {
        id: 'pitchshifter',
        label: 'Pitchshifter'
      },
      {
        id: 'gate',
        label: 'Gate'
      },
      {
        id: 'envelope',
        label: 'Envelope'
      },
      {
        id: 'knob',
        label: 'Knob'
      }
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
      },
      
    ]
  }
  ])
  const uiScale = useSettingsStore(state => state.uiScale)

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

  return <Container onWheel={e => { e.stopPropagation() }} scale={uiScale}>
    {options.map((o, i) => <div key={i}>
      <Tab active={options[i].active} onClick={(() => handleTabClick(i))}>
        <Triangle src={triangle} />
        {o.title}
      </Tab>
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

const Triangle = styled(SVG)`
  width: 7px;
  height: 4px;
  transform: rotate(90deg);
`

const Tab = styled.div<{ active: boolean }>`
${outsetBorder}
position: relative;
user-select: none;
display: flex;
align-items: center;
padding: 2px 15px 3px 5px;
gap: 5px;
background-color: ${surface};

&:hover {
  background-color: lightgray; 
  cursor: pointer;
}

${({ active }) => active && `${Triangle} {
  transform: rotate(180deg);
`}

`

const Options = styled.div<{ active: boolean }>`
overflow: hidden;
border-right: 1px outset;

height: 0;
${({ active }) => active ? `
  height: auto;
` : `
  border-bottom: none !important;
`}

&:hover {
  cursor: grab;
}
`
const Option = styled.div`
padding: 5px;

background-color: ${surface};

&:hover {
  background-color: lightgray; 
}
`

const Container = styled.div<{ scale: number }>`
background-color: ${surface};
box-sizing: border-box;
overflow-y: auto;
min-width: 100px;
max-height: calc(100% - ${headerHeight}px);
position: absolute;
z-index: 999;

${({ scale }) => `zoom: ${scale};`}

& > div:last-child > ${Options}:last-child {
  border-bottom: 1px outset;
}
  
`
