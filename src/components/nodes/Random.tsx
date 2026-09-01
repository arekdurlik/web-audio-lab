import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { CheckboxInput } from '../inputs/CheckboxInput';
import { NumberInput } from '../inputs/NumberInput';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { ButtonGroup, PlayButton } from './styled';
import { RandomParams, RandomProps } from './types';

const PoolGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, max-content);
    padding: 4px;
`;

export function Random({ id, data }: RandomProps) {
    const [params, setParams] = useState<RandomParams>({
        ...{
            mode: 'range' as const,
            min: 0,
            max: 1,
            pool: [0, 1],
            repeating: true,
            rate: 1,
            rateMin: 0.05,
            rateMax: 10,
            ramp: 0,
            expanded: { ra: true },
        },
        ...data.params,
    });
    const [displayValue, setDisplayValue] = useState(0);
    const paramsRef = useRef(params);
    paramsRef.current = params;

    const instance = useRef<ConstantSourceNode | null>(null);
    const setInstance = useNodeStore(state => state.setInstance);
    const setStaticConnection = useNodeStore(state => state.setStaticConnection);
    const removeStaticConnection = useNodeStore(state => state.removeStaticConnection);
    const { updateNode } = useUpdateFlowNode(id);

    const signalId = `${id}-signal`;
    const sockets: Socket[] = [
        {
            id: signalId,
            type: 'source',
            edge: 'right',
            offset: 24,
        },
    ];

    useEffect(() => {
        const node = new ConstantSourceNode(audio.context, { offset: 0 });
        node.start();
        instance.current = node;
        setInstance(signalId, node, 'source');

        // keeps the node processing (and its automation ticking) even with nothing patched -
        // browsers stall nodes with no path to destination
        const mute = new GainNode(audio.context, { gain: 0 });
        mute.connect(audio.context.destination);
        setStaticConnection(signalId, mute);

        return () => {
            try {
                node.stop();
                mute.disconnect(audio.context.destination);
                removeStaticConnection(signalId);
            } catch {}
        };
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    const lastPoolIndex = useRef<number | null>(null);

    useEffect(() => {
        function tick() {
            if (!instance.current) return;

            const { mode, min, max, pool, repeating, rate, ramp } = paramsRef.current;
            let target: number;

            if (mode === 'pool' && pool.length > 0) {
                let index = Math.floor(Math.random() * pool.length);
                if (!repeating && pool.length > 1) {
                    while (index === lastPoolIndex.current) {
                        index = Math.floor(Math.random() * pool.length);
                    }
                }
                lastPoolIndex.current = index;
                target = pool[index];
            } else {
                target = min + Math.random() * (max - min);
            }
            const now = audio.context.currentTime;

            instance.current.offset.cancelScheduledValues(now);
            instance.current.offset.setValueAtTime(instance.current.offset.value, now);
            instance.current.offset.linearRampToValueAtTime(target, now + rate * ramp);
        }

        tick();
        const timer = setInterval(tick, params.rate * 1000);
        return () => clearInterval(timer);
    }, [params.rate, params.ramp]);

    useEffect(() => {
        const poll = setInterval(() => {
            if (instance.current) setDisplayValue(instance.current.offset.value);
        }, 100);
        return () => clearInterval(poll);
    }, []);

    const Parameters = (
        <FlexContainer direction="column">
            <CheckboxInput
                id={`${id}-pool-mode`}
                label="Pool mode"
                value={params.mode === 'pool'}
                onChange={e =>
                    setParams(state => ({ ...state, mode: e.target.checked ? 'pool' : 'range' }))
                }
            />
            {params.mode === 'range' ? (
                <>
                    <Hr />
                    <FlexContainer align="center" gap={5}>
                    <NumberInput
                        label="Min:"
                        value={params.min}
                        width={50}
                        margin
                        onChange={v => setParams(state => ({ ...state, min: v }))}
                    />
                    <NumberInput
                        label="Max:"
                        value={params.max}
                        width={50}
                        margin
                        onChange={v => setParams(state => ({ ...state, max: v }))}
                    />
                    </FlexContainer>
                </>
            ) : (
                <FlexContainer direction="column">
                    <PoolGrid>
                        {params.pool.map((value, i) => (
                            <NumberInput
                                key={i}
                                value={value}
                                width={40}
                                onChange={v =>
                                    setParams(state => ({
                                        ...state,
                                        pool: state.pool.map((p, j) => (j === i ? v : p)),
                                    }))
                                }
                            />
                        ))}
                    </PoolGrid>
                    <ButtonGroup>
                        <PlayButton
                            onClick={() =>
                                setParams(state => ({ ...state, pool: [...state.pool, 0] }))
                            }
                            onMouseDownCapture={e => e.stopPropagation()}
                            onPointerDownCapture={e => e.stopPropagation()}
                        >
                            + Value
                        </PlayButton>
                        <PlayButton
                            onClick={() =>
                                setParams(state => ({
                                    ...state,
                                    pool: state.pool.length > 1 ? state.pool.slice(0, -1) : state.pool,
                                }))
                            }
                            onMouseDownCapture={e => e.stopPropagation()}
                            onPointerDownCapture={e => e.stopPropagation()}
                        >
                            - Value
                        </PlayButton>
                    </ButtonGroup>
                    <CheckboxInput
                        id={`${id}-repeating`}
                        label="Repeating"
                        value={params.repeating}
                        onChange={e =>
                            setParams(state => ({ ...state, repeating: e.target.checked }))
                        }
                    />
                </FlexContainer>
            )}
            <Hr />
            <RangeInput
                label="Rate (s):"
                value={params.rate}
                min={params.rateMin}
                max={params.rateMax}
                onChange={v => setParams(state => ({ ...state, rate: v }))}
                numberInput
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, rateMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, rateMax: v }))}
                expanded={params.expanded.ra}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, ra: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp:"
                value={params.ramp}
                min={0}
                max={1}
                step={0.01}
                onChange={v => setParams(state => ({ ...state, ramp: v }))}
                numberInput
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="RNG"
            value={displayValue.toFixed(3)}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
        />
    );
}
