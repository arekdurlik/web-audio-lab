import { useEffect, useRef, useState } from 'react';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { DelayParams, DelayProps } from './types';

export function Delay({ id, data }: DelayProps) {
    const [params, setParams] = useState<DelayParams>({
        ...{
            time: 0.5,
            min: 0,
            max: 2,
            ramp: 0.04,
            rampMin: 0,
            rampMax: 2,
            expanded: { t: true, r: false },
        },
        ...data.params,
    });

    const instance = useRef(new DelayNode(audio.context, { maxDelayTime: params.max }));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const audioId = `${id}-audio`;
    const controlVoltageId = `${id}-cv`;
    const sockets: Socket[] = [
        {
            id: audioId,
            label: '',
            type: 'target',
            edge: 'left',
            offset: 24,
        },
        {
            id: controlVoltageId,
            label: 't',
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
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        instance.current = new DelayNode(audio.context, { maxDelayTime: params.max });
        instance.current.delayTime.value = params.time;
        setInstance(audioId, instance.current, 'source');
        setInstance(controlVoltageId, instance.current.delayTime, 'param');
    }, [params.max]);

    useEffect(() => {
        if (params.time === undefined || Number.isNaN(params.time)) return;

        instance.current.delayTime.cancelScheduledValues(audio.context.currentTime);
        instance.current.delayTime.setValueAtTime(
            instance.current.delayTime.value,
            audio.context.currentTime
        );
        instance.current.delayTime.linearRampToValueAtTime(
            params.time,
            audio.context.currentTime + params.ramp
        );
    }, [params.time]);

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Time (s):"
                value={params.time}
                min={params.min}
                max={params.max}
                onChange={v => setParams(state => ({ ...state, time: v }))}
                numberInput
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, min: v }))}
                onMaxChange={v => setParams(state => ({ ...state, max: v }))}
                expanded={params.expanded.t}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, t: v } }))
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
            name="Delay"
            value={params.time}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
