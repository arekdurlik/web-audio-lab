import { Edge, Node } from 'reactflow'
import { LiveInput } from '../nodes/LiveInput'
import { Destination } from '../nodes/Destination'
import { Delay } from '../nodes/Delay'
import { Gain } from '../nodes/Gain'

export const propOptions = {
  hideAttribution: true
}

export const initialNodes: Node[] = [
  { 
    id: 'liveInput', 
    type: 'liveInput',
    position: { x: 10, y: 10 }, 
    data: { label: 'Live Input' }, 
  },
  { 
    id: 'destination', 
    type: 'destination',
    position: { x: 500, y: 300 }, 
    data: { label: 'Output' }, 
  },
  { 
    id: '1', 
    type: 'delayNode',
    position: { x: 150, y: -125 }, 
    data: { label: '1' }, 
  },
  { 
    id: '2', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '3', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '4', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '5', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '6', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '7', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '8', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '9', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '10', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '11', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '12', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '13', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '14', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '15', 
    type: 'delayNode',
    position: { x: 150, y: 0 }, 
    data: { label: 'x2' },
  },
  { 
    id: '13', 
    type: 'gainNode',
    position: { x: 150, y: 125 }, 
    data: { label: 'x2' },
  },
  { 
    id: '14', 
    type: 'gainNode',
    position: { x: 150, y: 125 }, 
    data: { label: 'x2' },
  }
]

export const nodeTypes = {
  delayNode: Delay,
  gainNode: Gain,
  liveInput: LiveInput,
  destination: Destination
}

export const initialEdges: Edge[] = []

export const edgeOptions = {
}