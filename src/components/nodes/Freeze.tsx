import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { RangeInput } from '../inputs/RangeInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { ButtonGroup, PlayButton } from './styled';
import { FreezeParams, FreezeProps } from './types';

export function Freeze({ id, data }: FreezeProps) {
    const [params, setParams] = useState<FreezeParams>({
        ...{
            frozen: false,
            sampleLength: 100,
            sampleLengthMin: 10,
            sampleLengthMax: 1000,
            rampUp: 20,
            rampUpMin: 0,
            rampUpMax: 500,
            rampDown: 20,
            rampDownMin: 0,
            rampDownMax: 500,
            crossfade: 50,
            expanded: { sl: true, ru: true, rd: true, cf: true },
        },
        ...data.params,
    });

    const instance = useAudioNode(() => new AudioWorkletNode(audio.context, 'freeze-processor'));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);

    const audioId = `${id}-audio`;
    const sockets: Socket[] = [
        { id: audioId, label: '', type: 'target', edge: 'left', offset: 24 },
        { id: audioId, type: 'source', edge: 'right', offset: 24 },
    ];

    useEffect(() => {
        setInstance(audioId, instance, 'source');
        instance.port.postMessage({
            cmd: 'params',
            sampleLength: params.sampleLength,
            rampUp: params.rampUp,
            rampDown: params.rampDown,
            crossfade: params.crossfade,
        });
        instance.onprocessorerror = e => console.error(e);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    function sendParams(patch: Partial<FreezeParams>) {
        setParams(state => {
            const next = { ...state, ...patch };
            instance.port.postMessage({
                cmd: 'params',
                sampleLength: next.sampleLength,
                rampUp: next.rampUp,
                rampDown: next.rampDown,
                crossfade: next.crossfade,
            });
            return next;
        });
    }

    function toggleFreeze() {
        const frozen = !params.frozen;
        instance.port.postMessage({ cmd: frozen ? 'freeze-on' : 'freeze-off' });
        setParams(state => ({ ...state, frozen }));
    }

    const Parameters = (
        <FlexContainer direction="column">
            <ButtonGroup>
                <FreezeButton
                    className={`${params.frozen && 'active'}`}
                    onClick={toggleFreeze}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    {params.frozen ? 'Unfreeze' : 'Freeze'}
                </FreezeButton>
            </ButtonGroup>
            <Hr />
            <RangeInput
                label="Length (ms):"
                value={params.sampleLength}
                min={params.sampleLengthMin}
                max={params.sampleLengthMax}
                step={1}
                onChange={v => sendParams({ sampleLength: v })}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, sampleLengthMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, sampleLengthMax: v }))}
                expanded={params.expanded.sl}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, sl: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp up (ms):"
                value={params.rampUp}
                min={params.rampUpMin}
                max={params.rampUpMax}
                step={1}
                onChange={v => sendParams({ rampUp: v })}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, rampUpMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, rampUpMax: v }))}
                expanded={params.expanded.ru}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, ru: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Ramp down (ms):"
                value={params.rampDown}
                min={params.rampDownMin}
                max={params.rampDownMax}
                step={1}
                onChange={v => sendParams({ rampDown: v })}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, rampDownMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, rampDownMax: v }))}
                expanded={params.expanded.rd}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, rd: v } }))
                }
            />
            <Hr />
            <RangeInput
                label="Crossfade (%):"
                value={params.crossfade}
                min={0}
                max={100}
                step={1}
                onChange={v => sendParams({ crossfade: v })}
                numberInput
                numberInputWidth={50}
                expanded={params.expanded.cf}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, cf: v } }))
                }
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Freeze"
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
            value={params.frozen ? 'frozen' : 'live'}
        />
    );
}

const FreezeButton = styled(PlayButton)`
    box-sizing: border-box;
`;
