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
import { Knob } from '../nodes/Knob'
import { Gate } from '../nodes/Gate'
import { Envelope } from '../nodes/Envelope'
import { Pitchshifter } from '../nodes/Pitchshifter'

export const propOptions = {
  hideAttribution: true
}

export const initialNodes: Node[] = [
  { 
    id: 'liveInput', 
    type: 'liveInput',
    position: { x: 720, y: 296 }, 
    data: { label: 'Live Input' }, 
  },
  { 
    id: 'destination', 
    type: 'destination',
    position: { x: 832, y: 296 }, 
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
  knob: Knob,

  bitcrusher: Bitcrusher,
  pitchshifter: Pitchshifter,
  gate: Gate,
  envelope: Envelope,

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