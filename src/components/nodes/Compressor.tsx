import { useEffect, useState } from 'react';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { CompressorParams, CompressorProps } from './types';

const NUMBER_INPUT_WIDTH = 52;

type CompressorParam = 'threshold' | 'knee' | 'ratio' | 'attack' | 'release';

export function Compressor({ id, data }: CompressorProps) {
    const [params, setParams] = useState<CompressorParams>({
        ...{
            threshold: -24,
            knee: 30,
            ratio: 12,
            attack: 0.003,
            release: 0.25,
            expanded: { th: true, k: true, r: true, a: true, rl: true },
        },
        ...data.params,
    });

    const instance = useAudioNode(
        () =>
            new DynamicsCompressorNode(audio.context, {
                threshold: params.threshold,
                knee: params.knee,
                ratio: params.ratio,
                attack: params.attack,
                release: params.release,
            })
    );
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const audioId = `${id}-audio`;
    const thresholdId = `${id}-threshold`;
    const kneeId = `${id}-knee`;
    const ratioId = `${id}-ratio`;
    const attackId = `${id}-attack`;
    const releaseId = `${id}-release`;
    const sockets: Socket[] = [
        {
            id: audioId,
            label: '',
            type: 'target',
            edge: 'left',
            offset: 24,
        },
        {
            id: thresholdId,
            label: 't',
            visual: 'param',
            type: 'target',
            edge: 'top',
            offset: 32,
        },
        {
            id: kneeId,
            label: 'k',
            visual: 'param',
            type: 'target',
            edge: 'top',
            offset: 64,
        },
        {
            id: attackId,
            label: 'a',
            visual: 'param',
            type: 'target',
            edge: 'bottom',
            offset: 24,
        },
        {
            id: releaseId,
            label: 'r',
            visual: 'param',
            type: 'target',
            edge: 'bottom',
            offset: 48,
        },
        {
            id: ratioId,
            label: 'x',
            visual: 'param',
            type: 'target',
            edge: 'bottom',
            offset: 72,
        },
        {
            id: audioId,
            type: 'source',
            edge: 'right',
            offset: 24,
        },
    ];

    useEffect(() => {
        setInstance(audioId, instance, 'source');
        setInstance(thresholdId, instance.threshold, 'param');
        setInstance(kneeId, instance.knee, 'param');
        setInstance(ratioId, instance.ratio, 'param');
        setInstance(attackId, instance.attack, 'param');
        setInstance(releaseId, instance.release, 'param');
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    function handleParam(param: CompressorParam, value: number) {
        setParams(state => ({ ...state, [param]: value }));
        setInstanceParam(param, value);
    }

    function setInstanceParam(param: CompressorParam, value: number) {
        if (value === undefined || Number.isNaN(value)) return;

        instance[param].setValueAtTime(instance[param].value, audio.context.currentTime);
        instance[param].linearRampToValueAtTime(value, audio.context.currentTime + 0.04);
    }

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Threshold (dB):"
                value={params.threshold}
                min={-100}
                max={0}
                onChange={value => handleParam('threshold', value)}
                numberInput
                numberInputWidth={NUMBER_INPUT_WIDTH}
                expanded={params.expanded.th}
                onExpandChange={th =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, th } }))
                }
            />
            <Hr />
            <RangeInput
                label="Knee (dB):"
                value={params.knee}
                min={0}
                max={40}
                onChange={value => handleParam('knee', value)}
                numberInput
                numberInputWidth={NUMBER_INPUT_WIDTH}
                expanded={params.expanded.k}
                onExpandChange={k =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, k } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ratio:"
                value={params.ratio}
                min={1}
                max={20}
                onChange={value => handleParam('ratio', value)}
                numberInput
                numberInputWidth={NUMBER_INPUT_WIDTH}
                expanded={params.expanded.r}
                onExpandChange={r =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, r } }))
                }
            />
            <Hr />
            <RangeInput
                label="Attack (s):"
                value={params.attack}
                min={0}
                max={1}
                step={0.001}
                onChange={value => handleParam('attack', value)}
                numberInput
                numberInputWidth={NUMBER_INPUT_WIDTH}
                expanded={params.expanded.a}
                onExpandChange={a =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, a } }))
                }
            />
            <Hr />
            <RangeInput
                label="Release (s):"
                value={params.release}
                min={0}
                max={1}
                step={0.001}
                onChange={value => handleParam('release', value)}
                numberInput
                numberInputWidth={NUMBER_INPUT_WIDTH}
                expanded={params.expanded.rl}
                onExpandChange={rl =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, rl } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Compressor"
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
