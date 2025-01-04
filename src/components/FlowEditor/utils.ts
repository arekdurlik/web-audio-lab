import { Node } from 'reactflow';
import { Analyser } from '../nodes/Analyser';
import { AudioBufferSource } from '../nodes/AudioBufferSource';
import { BiquadFilter } from '../nodes/BiquadFilter';
import { Bitcrusher } from '../nodes/Bitcrusher';
import { ConstantSource } from '../nodes/ConstantSource';
import { Convolver } from '../nodes/Convolver';
import { Delay } from '../nodes/Delay';
import { Destination } from '../nodes/Destination';
import { Envelope } from '../nodes/Envelope';
import { Gain } from '../nodes/Gain';
import { Gate } from '../nodes/Gate';
import { Knob } from '../nodes/Knob';
import { LiveInput } from '../nodes/LiveInput';
import { Note } from '../nodes/Note';
import { Oscillator } from '../nodes/Oscillator';
import { Pitchshifter } from '../nodes/Pitchshifter';
import { StereoPanner } from '../nodes/StereoPanner';
import { Text } from '../nodes/Text';
import { WaveShaper } from '../nodes/WaveShaper';
import { SPDTFork, SPDTJoin } from '../switches/SPDT';

export const propOptions = {
    hideAttribution: true,
};

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
    },
];

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
};

export const nodeSizes = {
    analyserNode: {
        x: 12,
        y: 3,
    },
    audioBufferSourceNode: {
        x: 6,
        y: 5,
    },
    liveInput: {
        x: 0,
        y: 1,
    },
    destination: {
        x: 0,
        y: 1,
    },
    knob: {
        x: 2,
        y: 2,
    },
    note: {
        x: 5,
        y: 3,
    },
    text: {
        x: 7,
        y: 2,
    },
    spdtFork: {
        x: 3,
        y: 3,
    },
    spdtJoin: {
        x: 3,
        y: 3,
    },
};

export type NodeType = keyof typeof nodeTypes;

type InitialData = {
    [key in NodeType]?: {};
};

export const initialNodeData: InitialData = {
    spdtJoin: {
        rotation: 2,
    },
};
