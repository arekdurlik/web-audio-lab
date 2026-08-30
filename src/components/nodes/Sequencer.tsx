import { useEffect, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import styled from 'styled-components';
import { MAX_STEPS, SequencerNode } from '../../audio/nodes/SequencerNode';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { CheckboxInput } from '../inputs/CheckboxInput';
import { NumberInput } from '../inputs/NumberInput';
import { RangeInput } from '../inputs/RangeInput';
import { SelectInput } from '../inputs/SelectInput';
import {
    ExpandableInputContent,
    ExpandableInputLabel,
    ExpandableInputWrapper,
    Triangle,
} from '../inputs/styled';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { PlayButton } from './styled';
import { SequencerDivision, SequencerParams, SequencerProps } from './types';
import triangleSvg from '/svg/triangle.svg';

const LANE_OFFSET = 16;

function defaultLane() {
    return {
        steps: Array.from({ length: MAX_STEPS }, () => ({
            value: 0,
            ramp: 0,
            rampAnchor: 'start' as const,
        })),
    };
}

export function Sequencer({ id, data }: SequencerProps) {
    const [params, setParams] = useState<SequencerParams>({
        ...{
            lanes: [defaultLane()],
            stepCount: 8,
            timingMode: 'free',
            freeSeconds: 0.25,
            bpm: 120,
            division: '1/8' as SequencerDivision,
            expanded: { s: true, l: true },
        },
        ...data.params,
    });
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    const instance = useAudioNode(() => new SequencerNode(audio.context, params.lanes.length));
    const setInstance = useNodeStore(state => state.setInstance);
    const removeInstance = useNodeStore(state => state.removeInstance);
    const { updateNode } = useUpdateFlowNode(id);
    const updateNodeInternals = useUpdateNodeInternals();

    const laneId = (i: number) => `${id}-lane-${i}`;
    const sockets: Socket[] = params.lanes.map((_, i) => ({
        id: laneId(i),
        type: 'source',
        edge: 'right',
        tooltip: `Lane ${i + 1}`,
        offset: 24 + i * LANE_OFFSET,
    }));

    // (re)activate lane outputs on every mount (incl. React StrictMode's dev double-invoke),
    // then apply saved params onto them
    useEffect(() => {
        instance.activateAll();

        instance.setStepCount(params.stepCount);
        instance.setTimingMode(params.timingMode);
        instance.setFreeSeconds(params.freeSeconds);
        instance.setBpm(params.bpm);
        instance.setDivision(params.division);

        params.lanes.forEach((lane, laneIndex) => {
            if (!instance.lanes[laneIndex]) instance.addLane();
            lane.steps.forEach((step, stepIndex) => {
                instance.setStep(laneIndex, stepIndex, step);
            });
            setInstance(laneId(laneIndex), instance.lanes[laneIndex].output, 'source');
        });

        const offStep = instance.onStep(setCurrentStep);
        const offPlay = instance.onPlayChange(setPlaying);

        return () => {
            offStep();
            offPlay();
            instance.deactivateAll();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    useEffect(() => {
        updateNodeInternals(id);
    }, [params.lanes.length]);

    function togglePlay() {
        playing ? instance.stop() : instance.start();
    }

    function addLane() {
        instance.addLane();
        setParams(state => ({ ...state, lanes: [...state.lanes, defaultLane()] }));
        setInstance(laneId(params.lanes.length), instance.lanes[params.lanes.length].output, 'source');
    }

    function removeLane() {
        if (params.lanes.length <= 1) return;

        const index = params.lanes.length - 1;
        removeInstance(laneId(index));
        instance.removeLane(index);
        setParams(state => ({ ...state, lanes: state.lanes.slice(0, -1) }));
    }

    function setStepCount(value: number) {
        instance.setStepCount(value);
        setParams(state => ({ ...state, stepCount: instance.stepCount }));
    }

    function setStep(
        laneIndex: number,
        stepIndex: number,
        patch: { value?: number; ramp?: number; rampAnchor?: 'start' | 'end' | 'both' }
    ) {
        instance.setStep(laneIndex, stepIndex, patch);
        setParams(state => ({
            ...state,
            lanes: state.lanes.map((lane, i) =>
                i !== laneIndex
                    ? lane
                    : {
                          steps: lane.steps.map((step, j) =>
                              j !== stepIndex ? step : { ...step, ...patch }
                          ),
                      }
            ),
        }));
    }

    const Parameters = (
        <FlexContainer direction="column">
            <FlexContainer align="center">
                <PlayButton
                    onClick={togglePlay}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    {playing ? 'Stop' : 'Start'}
                </PlayButton>
            </FlexContainer>
            <Hr />
            <RangeInput
                label="Steps:"
                value={params.stepCount}
                min={1}
                max={MAX_STEPS}
                step={1}
                numberInput
                numberInputWidth={30}
                onChange={setStepCount}
                expanded={params.expanded.s}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, s: v } }))
                }
                style={{ width: 120, flex: 'none' }}
            />
            <ExpandableInputContent $expanded={params.expanded.s}>
                    <CheckboxInput
                        id={`${id}-sync`}
                        label="Sync to BPM"
                        value={params.timingMode === 'sync'}
                        onChange={e => {
                            const timingMode = e.target.checked ? 'sync' : 'free';
                            instance.setTimingMode(timingMode);
                            setParams(state => ({ ...state, timingMode }));
                        }}
                    />
                    {params.timingMode === 'free' ? (
                        <NumberInput
                            label="Step time (s):"
                            value={params.freeSeconds}
                            min={0.01}
                            max={10}
                            step={0.01}
                            width={50}
                            margin
                            onChange={v => {
                                instance.setFreeSeconds(v);
                                setParams(state => ({ ...state, freeSeconds: v }));
                            }}
                        />
                    ) : (
                        <FlexContainer align="center" gap={5}>
                            <NumberInput
                                label="BPM:"
                                value={params.bpm}
                                min={1}
                                max={999}
                                step={1}
                                width={40}
                                margin
                                onChange={v => {
                                    instance.setBpm(v);
                                    setParams(state => ({ ...state, bpm: v }));
                                }}
                            />
                            <DivLabel>Div:</DivLabel>
                            <DivSelectWrapper>
                                <SelectInput
                                    value={params.division}
                                    onChange={e => {
                                        const division = e.target.value as SequencerDivision;
                                        instance.setDivision(division);
                                        setParams(state => ({ ...state, division }));
                                    }}
                                    options={[
                                        { value: '1/1', label: '1/1' },
                                        { value: '1/2', label: '1/2' },
                                        { value: '1/4', label: '1/4' },
                                        { value: '1/8', label: '1/8' },
                                        { value: '1/16', label: '1/16' },
                                        { value: '1/8t', label: '1/8 triplet' },
                                        { value: '1/16t', label: '1/16 triplet' },
                                    ]}
                                />
                            </DivSelectWrapper>
                        </FlexContainer>
                    )}
            </ExpandableInputContent>
            <Hr />
            <ExpandableInputWrapper>
                <ExpandableInputLabel
                    $expanded={params.expanded.l}
                    onClick={() =>
                        setParams(state => ({
                            ...state,
                            expanded: { ...state.expanded, l: !state.expanded.l },
                        }))
                    }
                >
                    <span>Lanes:</span>
                    <Triangle $expanded={params.expanded.l} src={triangleSvg} />
                </ExpandableInputLabel>
                <ExpandableInputContent $expanded={params.expanded.l}>
                    <FlexContainer align="center">
                        <PlayButton onClick={addLane}>+ Lane</PlayButton>
                        <PlayButton onClick={removeLane}>- Lane</PlayButton>
                    </FlexContainer>
                    {params.lanes.map((lane, laneIndex) => (
                        <LaneGroup key={laneIndex}>
                            <LaneGroupLabel>Lane {laneIndex + 1}:</LaneGroupLabel>
                            <StepRow>
                                <RowLabel>Value:</RowLabel>
                                {lane.steps.slice(0, params.stepCount).map((step, stepIndex) => (
                                    <StepInput
                                        key={stepIndex}
                                        type="number"
                                        value={step.value}
                                        title="value"
                                        $active={playing && currentStep === stepIndex}
                                        onMouseDownCapture={e => e.stopPropagation()}
                                        onPointerDownCapture={e => e.stopPropagation()}
                                        onChange={e =>
                                            setStep(laneIndex, stepIndex, {
                                                value: Number(e.target.value),
                                            })
                                        }
                                    />
                                ))}
                            </StepRow>
                            <StepRow>
                                <RowLabel>Ramp:</RowLabel>
                                {lane.steps.slice(0, params.stepCount).map((step, stepIndex) => (
                                    <StepInput
                                        key={stepIndex}
                                        type="number"
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        value={step.ramp}
                                        title="ramp (fraction of step length)"
                                        $active={playing && currentStep === stepIndex}
                                        onMouseDownCapture={e => e.stopPropagation()}
                                        onPointerDownCapture={e => e.stopPropagation()}
                                        onChange={e =>
                                            setStep(laneIndex, stepIndex, {
                                                ramp: Math.min(1, Math.max(0, Number(e.target.value))),
                                            })
                                        }
                                    />
                                ))}
                            </StepRow>
                            <StepRow>
                                <RowLabel>Glide:</RowLabel>
                                {lane.steps.slice(0, params.stepCount).map((step, stepIndex) => (
                                    <AnchorButton
                                        key={stepIndex}
                                        type="button"
                                        title={
                                            step.rampAnchor === 'start'
                                                ? 'Glides in at the start of the step'
                                                : step.rampAnchor === 'end'
                                                ? 'Holds, then glides out into the next step'
                                                : 'Glides in, then glides out (each capped at half the step)'
                                        }
                                        onMouseDownCapture={e => e.stopPropagation()}
                                        onPointerDownCapture={e => e.stopPropagation()}
                                        onClick={() =>
                                            setStep(laneIndex, stepIndex, {
                                                rampAnchor:
                                                    step.rampAnchor === 'start'
                                                        ? 'end'
                                                        : step.rampAnchor === 'end'
                                                        ? 'both'
                                                        : 'start',
                                            })
                                        }
                                    >
                                        {step.rampAnchor === 'start'
                                            ? 'In'
                                            : step.rampAnchor === 'end'
                                            ? 'Out'
                                            : 'Both'}
                                    </AnchorButton>
                                ))}
                            </StepRow>
                        </LaneGroup>
                    ))}
                </ExpandableInputContent>
            </ExpandableInputWrapper>
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Sequencer"
            data={data}
            sockets={sockets}
            height={2 + params.lanes.length}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parametersWidth={400}
            parameters={Parameters}
            value={playing && currentStep >= 0 ? currentStep + 1 : '-'}
        />
    );
}

const DivLabel = styled.span`
    font-size: 11px;
`;

const DivSelectWrapper = styled.div`
    & > div {
        flex: none;
    }

    select {
        width: auto;
        margin: 0;
    }
`;

const LaneGroup = styled.div`
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 6px;
`;

const LaneGroupLabel = styled.span`
    display: block;
    padding-top: 2px;
    padding-bottom: 2px;
`;

const StepRow = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 1px;
`;

const AnchorButton = styled.button`
    box-sizing: border-box;
    flex: none;
    width: 34px;
    min-width: 34px;
    max-width: 34px;
    height: 15px;
    border-radius: 0;
    border: 1px solid #000;
    outline: none;
    font-size: 9px;
    line-height: 1;
    padding: 0;
    margin: 0;
    appearance: none;
    -webkit-appearance: none;

    &:disabled {
        color: #aaa;
    }
`;

const RowLabel = styled.span`
    width: 40px;
    font-size: 10px;
`;

const StepInput = styled.input<{ $active?: boolean }>`
    box-sizing: border-box;
    flex: none;
    width: 34px;
    min-width: 34px;
    max-width: 34px;
    border-radius: 0;
    border: 1px solid #000;
    outline: none;
    font-size: 10px;
    padding: 0 2px;
    margin: 0;
    ${({ $active }) => $active && 'background-color: #a0d0ff;'}
`;
