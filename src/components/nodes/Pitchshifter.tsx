//@ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Socket } from './BaseNode/types';
import { PitchshifterParams, PitchshifterProps } from './types';

export function Pitchshifter({ id, data }: PitchshifterProps) {
    const [params, setParams] = useState<PitchshifterParams>({
        ...{ pitchOffset: 12, expanded: { p: true } },
        ...data.params,
    });
    const audioIdInput = `${id}-audioInput`;
    const audioIdOutput = `${id}-audioOutput`;
    const instance = useRef(new Jungle(audio.context));
    const [input] = useState(new GainNode(audio.context));
    const [output] = useState(new GainNode(audio.context));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);
    const sockets: Socket[] = [
        {
            id: audioIdInput,
            label: '',
            type: 'target',
            edge: 'left',
            offset: 24,
        },
        {
            id: audioIdOutput,
            type: 'source',
            edge: 'right',
            offset: 24,
        },
    ];

    useEffect(() => {
        input.connect(instance.current.input);
        instance.current.output.connect(output);

        setInstance(audioIdInput, input, 'target');
        setInstance(audioIdOutput, output, 'source');
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        instance.current.setPitchOffset(getMultiplier(params.pitchOffset));
    }, [params.pitchOffset]);

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Pitch offset:"
                value={params.pitchOffset}
                numberInput
                min={-24}
                max={24}
                step={0.01}
                onChange={v => setParams(state => ({ ...state, pitchOffset: v }))}
                expanded={params.expanded.p}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, p: v } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Pitchshift"
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}

export const getMultiplier = x => {
    // don't ask...
    if (x < 0) {
        return x / 12;
    } else {
        var a5 = 1.8149080040913423e-7;
        var a4 = -0.000019413043101157434;
        var a3 = 0.0009795096626987743;
        var a2 = -0.014147877819596033;
        var a1 = 0.23005591195033048;
        var a0 = 0.02278153473118749;

        var x1 = x;
        var x2 = x * x;
        var x3 = x * x * x;
        var x4 = x * x * x * x;
        var x5 = x * x * x * x * x;

        return a0 + x1 * a1 + x2 * a2 + x3 * a3 + x4 * a4 + x5 * a5;
    }
};

// include https://github.com/cwilso/Audio-Input-Effects/blob/master/js/jungle.js

// Copyright 2012, Google Inc.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//     * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function createFadeBuffer(context, activeTime, fadeTime) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);

    var fadeLength = fadeTime * context.sampleRate;

    var fadeIndex1 = fadeLength;
    var fadeIndex2 = length1 - fadeLength;

    // 1st part of cycle
    for (var i = 0; i < length1; ++i) {
        var value;

        if (i < fadeIndex1) {
            value = Math.sqrt(i / fadeLength);
        } else if (i >= fadeIndex2) {
            value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
        } else {
            value = 1;
        }

        p[i] = value;
    }

    // 2nd part
    for (var i = length1; i < length; ++i) {
        p[i] = 0;
    }

    return buffer;
}

function createDelayTimeBuffer(context, activeTime, fadeTime, shiftUp) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);

    // 1st part of cycle
    for (var i = 0; i < length1; ++i) {
        if (shiftUp)
            // This line does shift-up transpose
            p[i] = (length1 - i) / length;
        // This line does shift-down transpose
        else p[i] = i / length1;
    }

    // 2nd part
    for (var i = length1; i < length; ++i) {
        p[i] = 0;
    }

    return buffer;
}

var delayTime = 0.1;
var fadeTime = 0.05;
var bufferTime = 0.1;

export function Jungle(context) {
    this.context = context;
    // Create nodes for the input and output of this "module".
    var input = context.createGain();
    var output = context.createGain();
    this.input = input;
    this.output = output;

    // Delay modulation.
    var mod1 = context.createBufferSource();
    var mod2 = context.createBufferSource();
    var mod3 = context.createBufferSource();
    var mod4 = context.createBufferSource();
    this.shiftDownBuffer = createDelayTimeBuffer(context, bufferTime, fadeTime, false);
    this.shiftUpBuffer = createDelayTimeBuffer(context, bufferTime, fadeTime, true);
    mod1.buffer = this.shiftDownBuffer;
    mod2.buffer = this.shiftDownBuffer;
    mod3.buffer = this.shiftUpBuffer;
    mod4.buffer = this.shiftUpBuffer;
    mod1.loop = true;
    mod2.loop = true;
    mod3.loop = true;
    mod4.loop = true;

    // for switching between oct-up and oct-down
    var mod1Gain = new GainNode(context);
    var mod2Gain = new GainNode(context);
    var mod3Gain = new GainNode(context);
    var mod4Gain = new GainNode(context);
    mod3Gain.gain.value = 0;
    mod4Gain.gain.value = 0;

    mod1.connect(mod1Gain);
    mod2.connect(mod2Gain);
    mod3.connect(mod3Gain);
    mod4.connect(mod4Gain);

    // Delay amount for changing pitch.
    var modGain1 = context.createGain();
    var modGain2 = context.createGain();

    var delay1 = context.createDelay();
    var delay2 = context.createDelay();
    mod1Gain.connect(modGain1);
    mod2Gain.connect(modGain2);
    mod3Gain.connect(modGain1);
    mod4Gain.connect(modGain2);
    modGain1.connect(delay1.delayTime);
    modGain2.connect(delay2.delayTime);

    // Crossfading.
    var fade1 = context.createBufferSource();
    var fade2 = context.createBufferSource();
    var fadeBuffer = createFadeBuffer(context, bufferTime, fadeTime);
    fade1.buffer = fadeBuffer;
    fade2.buffer = fadeBuffer;
    fade1.loop = true;
    fade2.loop = true;

    var mix1 = context.createGain();
    var mix2 = context.createGain();
    mix1.gain.value = 0;
    mix2.gain.value = 0;

    fade1.connect(mix1.gain);
    fade2.connect(mix2.gain);

    // Connect processing graph.
    input.connect(delay1);
    input.connect(delay2);
    delay1.connect(mix1);
    delay2.connect(mix2);
    mix1.connect(output);
    mix2.connect(output);

    // Start
    var t = context.currentTime + 0.01;
    var t2 = t + bufferTime - fadeTime;
    mod1.start(t);
    mod2.start(t2);
    mod3.start(t);
    mod4.start(t2);
    fade1.start(t);
    fade2.start(t2);

    this.mod1 = mod1;
    this.mod2 = mod2;
    this.mod1Gain = mod1Gain;
    this.mod2Gain = mod2Gain;
    this.mod3Gain = mod3Gain;
    this.mod4Gain = mod4Gain;
    this.modGain1 = modGain1;
    this.modGain2 = modGain2;
    this.fade1 = fade1;
    this.fade2 = fade2;
    this.mix1 = mix1;
    this.mix2 = mix2;
    this.delay1 = delay1;
    this.delay2 = delay2;

    this.setDelay(delayTime);
}

Jungle.prototype.setDelay = function (delayTime) {
    this.modGain1.gain.setTargetAtTime(0.5 * delayTime, 0, 0.01);
    this.modGain2.gain.setTargetAtTime(0.5 * delayTime, 0, 0.01);
};

Jungle.prototype.setPitchOffset = function (mult) {
    if (mult > 0) {
        // pitch up
        this.mod1Gain.gain.value = 0;
        this.mod2Gain.gain.value = 0;
        this.mod3Gain.gain.value = 1;
        this.mod4Gain.gain.value = 1;
    } else {
        // pitch down
        this.mod1Gain.gain.value = 1;
        this.mod2Gain.gain.value = 1;
        this.mod3Gain.gain.value = 0;
        this.mod4Gain.gain.value = 0;
    }
    this.setDelay(delayTime * Math.abs(mult));
};
