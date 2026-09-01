import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { window_frame } from '../../98';
import { LooperNode, LooperState } from '../../audio/nodes/LooperNode';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { nodeSizes } from '../FlowEditor/utils';
import { CheckboxInput } from '../inputs/CheckboxInput';
import { RangeInput } from '../inputs/RangeInput';
import { ExpandableInputContainer } from '../inputs/styled';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { ButtonGroup, PlayButton } from './styled';
import { LooperParams, LooperProps } from './types';

const TOGGLE_LABEL: Record<LooperState, string> = {
    empty: 'Record',
    recording: 'Stop Rec',
    playing: 'Overdub',
    overdubbing: 'Stop Dub',
    stopped: 'Overdub',
};

const VALUE_LABEL: Record<LooperState, string> = {
    empty: 'empty',
    recording: 'rec',
    playing: 'play',
    overdubbing: 'dub',
    stopped: 'stop',
};

export function Looper({ id, data }: LooperProps) {
    const [params, setParams] = useState<LooperParams>({
        ...{ speed: 1, speedMin: 0, speedMax: 2, reverse: false, expanded: { sp: true } },
        ...data.params,
    });
    const [state, setState] = useState<LooperState>('empty');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const instance = useAudioNode(() => new LooperNode(audio.context));
    const setInstance = useNodeStore(state => state.setInstance);
    const setStaticConnection = useNodeStore(state => state.setStaticConnection);
    const removeStaticConnection = useNodeStore(state => state.removeStaticConnection);
    const { updateNode } = useUpdateFlowNode(id);
    const positionId = `${id}-position`;
    const scrubConnected = useNodeStore(state =>
        state.connections.some(c => c.target === positionId)
    );

    const audioId = `${id}-audio`;
    const speedId = `${id}-speed`;
    const triggerId = `${id}-trigger`;
    const loopId = `${id}-loop`;
    const sockets: Socket[] = [
        { id: audioId, label: '', type: 'target', edge: 'left', offset: 32 },
        { id: speedId, label: 's', visual: 'param', type: 'target', edge: 'top', offset: 32 },
        { id: positionId, label: 'p', visual: 'param', type: 'target', edge: 'top', offset: 64 },
        { id: triggerId, type: 'source', edge: 'right', tooltip: 'Playback trigger', offset: 48 },
        { id: loopId, type: 'source', edge: 'right', tooltip: 'Loop only', offset: 32 },
        { id: audioId, type: 'source', edge: 'right', tooltip: 'Audio', offset: 16 },
    ];

    useEffect(() => {
        setInstance(audioId, instance.node, 'source');
        setInstance(speedId, instance.speed, 'param');
        setInstance(positionId, instance.scrub, 'param');
        setInstance(triggerId, instance.trigger, 'source');
        setInstance(loopId, instance.loop, 'source');
        setStaticConnection(audioId, instance.trigger, 1);
        setStaticConnection(audioId, instance.loop, 2);
        instance.speed.setValueAtTime(params.speed, audio.context.currentTime);
        instance.setReverse(params.reverse);

        const offState = instance.onStateChange(state => {
            setState(state);
            setDuration(instance.duration);
        });
        const offPosition = instance.onPosition(setPosition);
        const offElapsed = instance.onElapsed(setElapsed);

        return () => {
            removeStaticConnection(audioId);
            offState();
            offPosition();
            offElapsed();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        instance.setScrubConnected(scrubConnected);
    }, [instance, scrubConnected]);

    const Parameters = (
        <FlexContainer direction="column">
            <ButtonGroup>
                <LooperButton
                    onClick={() => instance.toggle()}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    {TOGGLE_LABEL[state]}
                </LooperButton>
                <LooperButton
                    onClick={() => (state === 'stopped' ? instance.play() : instance.stop())}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                    disabled={state === 'empty' || state === 'recording'}
                >
                    {state === 'stopped' ? 'Play' : 'Stop'}
                </LooperButton>
                <LooperButton
                    onClick={() => instance.undo()}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    Undo
                </LooperButton>
                <LooperButton
                    onClick={() => instance.clear()}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    Clear
                </LooperButton>
            </ButtonGroup>
            <ExpandableInputContainer direction="column" gap={2}>
                <span>
                    {state === 'recording'
                        ? formatTime(elapsed)
                        : `${formatTime(position * duration)}/${formatTime(duration)}`}
                </span>
                <PositionBar>
                    <PositionFill
                        style={{
                            width: `${(state === 'playing' || state === 'overdubbing' ? position : 0) * 100}%`,
                        }}
                    />
                </PositionBar>
            </ExpandableInputContainer>
            <Hr />
            <RangeInput
                label="Speed:"
                value={params.speed}
                min={params.speedMin}
                max={params.speedMax}
                step={0.01}
                onChange={v => {
                    instance.speed.setValueAtTime(v, audio.context.currentTime);
                    setParams(state => ({ ...state, speed: v }));
                }}
                numberInput
                numberInputWidth={50}
                adjustableBounds
                onMinChange={v => setParams(state => ({ ...state, speedMin: v }))}
                onMaxChange={v => setParams(state => ({ ...state, speedMax: v }))}
                expanded={params.expanded.sp}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, sp: v } }))
                }
            />
            <Hr />
            <CheckboxInput
                id={`${id}-reverse`}
                label="Reverse"
                value={params.reverse}
                onChange={e => {
                    instance.setReverse(e.target.checked);
                    setParams(state => ({ ...state, reverse: e.target.checked }));
                }}
            />
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Looper"
            data={data}
            sockets={sockets}
            height={nodeSizes.looper.y}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
            value={VALUE_LABEL[state]}
        />
    );
}

function formatTime(seconds: number) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const LooperButton = styled(PlayButton)`
    box-sizing: border-box;
    padding: 0;
    flex: none;
    width: 55px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const PositionBar = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 4px;
    background: #ddd;
    border: 1px solid ${window_frame};
`;

const PositionFill = styled.div`
    height: 100%;
    background: #4c4;
`;
