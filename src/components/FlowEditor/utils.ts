import { Edge, Node } from 'reactflow'
import { LiveInput } from '../nodes/LiveInput'
import { Destination } from '../nodes/Destination'
import { Delay } from '../nodes/Delay'
import { Gain } from '../nodes/Gain'
import { BiquadFilter } from '../nodes/BiquadFilter'
import { Oscillator } from '../nodes/Oscillator'
import { ConstantSource } from '../nodes/ConstantSource'
import { StereoPanner } from '../nodes/StereoPanner'
import { AudioBufferSource } from '../nodes/AudioBufferSource'
import { Convolver } from '../nodes/Convolver'
import { Bitcrusher } from '../nodes/Bitcrusher'

export const propOptions = {
  hideAttribution: true
}

export const initialNodes: Node[] = [
  { 
    id: 'liveInput', 
    type: 'liveInput',
    position: { x: 320, y: 100 }, 
    data: { label: 'Live Input' }, 
  },
  { 
    id: 'destination', 
    type: 'destination',
    position: { x: 300, y: 200 }, 
    data: { label: 'Output' }, 
  }
]

export const nodeTypes = {
  delayNode: Delay,
  gainNode: Gain,
  convolverNode: Convolver,
  stereoPannerNode: StereoPanner,
  constantSourceNode: ConstantSource,
  filterNode: BiquadFilter,
  oscillatorNode: Oscillator,
  audioBufferSourceNode: AudioBufferSource,
  liveInput: LiveInput,
  destination: Destination,

  bitcrusher: Bitcrusher
}