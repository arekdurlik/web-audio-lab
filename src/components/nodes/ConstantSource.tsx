import { useEffect, useRef, useState } from 'react';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { PlayButton } from './styled';
import { ConstantSourceParams, ConstantSourceProps } from './types';

export function ConstantSource({ id, data }: ConstantSourceProps) {
    const [params, setParams] = useState<ConstantSourceParams>({
        ...{
            playing: false,
            offset: 0,
            min: 0,
            max: 1,
            ramp: 0.04,
            rampMin: 0,
            rampMax: 2,
            expanded: { o: true, r: false },
        },
        ...data.params,
    });

    const instance = useRef(new ConstantSourceNode(audio.context, { offset: params.offset }));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const signalId = `${id}-signal`;
    const offsetId = `${id}-offset`;
    const sockets: Socket[] = [
        {
            id: signalId,
            type: 'source',
            edge: 'right',
            offset: 24,
        },
        {
            id: offsetId,
            label: 'o',
            visual: 'param',
            type: 'target',
            edge: 'top',
            offset: 48,
        },
    ];

    useEffect(() => {
        return () => {
            try {
                instance.current.offset.value = 0;
                instance.current.stop();
            } catch {}
        };
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        if (params.offset === undefined || Number.isNaN(params.offset)) return;

        instance.current.offset.cancelScheduledValues(audio.context.currentTime);
        instance.current.offset.setValueAtTime(
            instance.current.offset.value,
            audio.context.currentTime
        );
        instance.current.offset.linearRampToValueAtTime(
            params.offset,
            audio.context.currentTime + params.ramp
        );
    }, [params.offset]);

    useEffect(() => {
        if (params.playing) {
            try {
                instance.current.stop();
            } catch {}
            instance.current = new ConstantSourceNode(audio.context, { offset: params.offset });

            setInstance(signalId, instance.current, 'source');
            setInstance(offsetId, instance.current.offset, 'param');
            instance.current.start();
        } else {
            try {
                instance.current.stop();
            } catch {}
        }
    }, [params.playing]);

    const Parameters = (
        <FlexContainer direction="column">
            <FlexContainer>
                <PlayButton
                    onClick={() => setParams(state => ({ ...state, playing: !state.playing }))}
                >
                    {params.playing ? 'Stop' : 'Start'}
                </PlayButton>
            </FlexContainer>
            <Hr />
            <RangeInput
                label="Offset:"
                value={params.offset}
                step={0.001}
                min={params.min}
                max={params.max}
                onChange={v => setParams(state => ({ ...state, offset: v }))}
                numberInput
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, min: v }))}
                onMaxChange={v => setParams(state => ({ ...state, max: v }))}
                expanded={params.expanded.o}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, o: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp (s):"
                value={params.ramp}
                min={params.rampMin}
                max={params.rampMax}
                onChange={v => setParams(state => ({ ...state, ramp: v }))}
                numberInput
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, rampMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, rampMax: v }))}
                expanded={params.expanded.r}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, r: v } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Constant"
            value={params.offset}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
