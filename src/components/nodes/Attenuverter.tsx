import { useEffect, useRef, useState } from 'react';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { AttenuverterParams, AttenuverterProps } from './types';

export function Attenuverter({ id, data }: AttenuverterProps) {
    const [params, setParams] = useState<AttenuverterParams>({
        ...{
            amount: 1,
            amountMin: -1,
            amountMax: 1,
            offset: 0,
            offsetMin: -1,
            offsetMax: 1,
            ramp: 0.04,
            rampMin: 0,
            rampMax: 2,
            expanded: { a: true, o: true, r: false },
        },
        ...data.params,
    });

    const input = useAudioNode(() => new GainNode(audio.context, { gain: params.amount }));
    const output = useAudioNode(() => new GainNode(audio.context));
    const offsetSource = useRef<ConstantSourceNode | null>(null);
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const inputId = `${id}-input`;
    const outputId = `${id}-output`;
    const amountId = `${id}-amount`;
    const offsetId = `${id}-offset`;
    const sockets: Socket[] = [
        { id: inputId, type: 'target', edge: 'left', offset: 24 },
        { id: amountId, label: 'a', visual: 'param', type: 'target', edge: 'top' },
        { id: offsetId, label: 'o', visual: 'param', type: 'target', edge: 'top' },
        { id: outputId, type: 'source', edge: 'right', offset: 24 },
    ];

    useEffect(() => {
        const source = new ConstantSourceNode(audio.context, { offset: params.offset });
        offsetSource.current = source;

        input.connect(output);
        source.connect(output);
        source.start();

        setInstance(inputId, input, 'target');
        setInstance(outputId, output, 'source');
        setInstance(amountId, input.gain, 'param');
        setInstance(offsetId, source.offset, 'param');

        return () => {
            input.disconnect(output);
            source.disconnect(output);
            source.stop();
            if (offsetSource.current === source) offsetSource.current = null;
        };
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        if (Number.isNaN(params.amount)) return;
        const now = audio.context.currentTime;
        input.gain.cancelScheduledValues(now);
        input.gain.setValueAtTime(input.gain.value, now);
        input.gain.linearRampToValueAtTime(params.amount, now + params.ramp);
    }, [params.amount]);

    useEffect(() => {
        const offset = offsetSource.current?.offset;
        if (!offset || Number.isNaN(params.offset)) return;
        const now = audio.context.currentTime;
        offset.cancelScheduledValues(now);
        offset.setValueAtTime(offset.value, now);
        offset.linearRampToValueAtTime(params.offset, now + params.ramp);
    }, [params.offset]);

    const Parameters = (
        <FlexContainer direction="column">
            <RangeInput
                label="Amount:"
                value={params.amount}
                min={params.amountMin}
                max={params.amountMax}
                step={0.001}
                onChange={amount => setParams(state => ({ ...state, amount }))}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={amountMin => setParams(state => ({ ...state, amountMin }))}
                onMaxChange={amountMax => setParams(state => ({ ...state, amountMax }))}
                expanded={params.expanded.a}
                onExpandChange={a =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, a } }))
                }
            />
            <Hr />
            <RangeInput
                label="Offset:"
                value={params.offset}
                min={params.offsetMin}
                max={params.offsetMax}
                step={0.001}
                onChange={offset => setParams(state => ({ ...state, offset }))}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={offsetMin => setParams(state => ({ ...state, offsetMin }))}
                onMaxChange={offsetMax => setParams(state => ({ ...state, offsetMax }))}
                expanded={params.expanded.o}
                onExpandChange={o =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, o } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp (s):"
                value={params.ramp}
                min={params.rampMin}
                max={params.rampMax}
                onChange={ramp => setParams(state => ({ ...state, ramp }))}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={rampMin => setParams(state => ({ ...state, rampMin }))}
                onMaxChange={rampMax => setParams(state => ({ ...state, rampMax }))}
                expanded={params.expanded.r}
                onExpandChange={r =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, r } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Attenuverter"
            value={params.amount}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
