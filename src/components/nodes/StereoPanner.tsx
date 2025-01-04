import { useEffect, useState } from 'react';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { StereoPannerParams, StereoPannerProps } from './types';

export function StereoPanner({ id, data }: StereoPannerProps) {
    const [params, setParams] = useState<StereoPannerParams>({
        ...{
            pan: 0,
            min: -1,
            max: 1,
            ramp: 0.04,
            rampMin: 0,
            rampMax: 2,
            expanded: { p: true, r: false },
        },
        ...data.params,
    });

    const [instance] = useState(new StereoPannerNode(audio.context, { pan: params.pan }));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const audioId = `${id}-audio`;
    const panId = `${id}-pan`;
    const sockets: Socket[] = [
        {
            id: audioId,
            label: '',
            type: 'target',
            edge: 'left',
            offset: 24,
        },
        {
            id: panId,
            label: 'p',
            visual: 'param',
            type: 'target',
            edge: 'top',
            offset: 48,
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
        setInstance(panId, instance.pan, 'param');
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        if (params.pan === undefined || Number.isNaN(params.pan)) return;

        instance.pan.setValueAtTime(instance.pan.value, audio.context.currentTime);
        instance.pan.linearRampToValueAtTime(params.pan, audio.context.currentTime + params.ramp);
    }, [params.pan]);

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Pan:"
                value={params.pan}
                min={params.min}
                max={params.max}
                onChange={v => setParams(state => ({ ...state, pan: v }))}
                onMinChange={v => setParams(state => ({ ...state, min: v }))}
                onMaxChange={v => setParams(state => ({ ...state, max: v }))}
                numberInput
                adjustableBounds
                expanded={params.expanded.p}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, p: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp (s):"
                value={params.ramp}
                min={params.rampMin}
                max={params.rampMax}
                onChange={v => setParams(state => ({ ...state, ramp: v }))}
                onMinChange={v => setParams(state => ({ ...state, rampMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, rampMax: v }))}
                numberInput
                adjustableBounds
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
            name="Stereo panner"
            value={params.pan}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
