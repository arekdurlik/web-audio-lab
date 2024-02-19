import { Node } from 'reactflow'
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
import { WaveShaper } from '../nodes/WaveShaper'
import { Note } from '../nodes/Note'
import { Text } from '../nodes/Text'
import { SPDTFork, SPDTJoin } from '../switches/SPDT'
import { Analyser } from '../nodes/Analyser'

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
  waveShaperNode: WaveShaper,
  audioBufferSourceNode: AudioBufferSource,
  analyserNode: Analyser,
  liveInput: LiveInput,
  destination: Destination,

  note: Note,
  text: Text,

  bitcrusher: Bitcrusher,

  spdtFork: SPDTFork,
  spdtJoin: SPDTJoin,
}

export type NodeType = keyof typeof nodeTypes

type InitialData = {
  [key in NodeType]?: {}
}

export const initialNodeData: InitialData = {
  spdtJoin: {
    rotation: 2
  }
}