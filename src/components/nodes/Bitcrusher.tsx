import { useEffect, useRef, useState } from 'react';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { BitcrusherParams, BitcrusherProps } from './types';

export function Bitcrusher({ id, data }: BitcrusherProps) {
    const [params, setParams] = useState<BitcrusherParams>({
        ...{ bitDepth: 16, sampleRateReduction: 1, expanded: { b: true, s: true } },
        ...data.params,
    });

    const instance = useRef(
        new AudioWorkletNode(audio.context, 'bit-crusher-processor', {
            parameterData: {
                bitDepth: params.bitDepth,
                frequencyReduction: params.sampleRateReduction,
            },
        })
    );
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const audioId = `${id}-audio`;
    const sockets: Socket[] = [
        {
            id: audioId,
            label: '',
            type: 'target',
            edge: 'left',
            offset: 24,
        },
        {
            id: audioId,
            type: 'source',
            edge: 'right',
            offset: 24,
        },
    ];

    useEffect(() => {
        setInstance(audioId, instance.current, 'source');
    }, []);

    // update reactflow and audio instance
    useEffect(() => {
        updateNode({ params });
    }, [params]);

    function handleBitDepth(value: number) {
        setParams(state => ({ ...state, bitDepth: value }));
        instance.current.parameters
            .get('bitDepth')
            ?.setValueAtTime(value, audio.context.currentTime);
    }

    function handleSampleRateReduction(value: number) {
        setParams(state => ({ ...state, sampleRateReduction: value }));
        instance.current.parameters
            .get('frequencyReduction')
            ?.setValueAtTime(value, audio.context.currentTime);
    }

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Bit depth:"
                value={params.bitDepth}
                min={1}
                max={16}
                step={1}
                onChange={handleBitDepth}
                numberInput
                expanded={params.expanded.b}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, b: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Sample rate reduction:"
                value={params.sampleRateReduction}
                min={1}
                max={50}
                step={1}
                onChange={handleSampleRateReduction}
                numberInput
                expanded={params.expanded.s}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, s: v } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Bitcrusher"
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
