import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { GranularNode } from '../../audio/nodes/GranularNode';
import { useAudioNode } from '../../hooks/useAudioNode';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { ExpandableInputLabel, ExpandableInputWrapper, Triangle } from '../inputs/styled';
import { RangeInput } from '../inputs/RangeInput';
import { SelectInput } from '../inputs/SelectInput';
import { bayerThreshold } from '../ui/ColorPicker/color';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { ButtonGroup, PlayButton } from './styled';
import { GranularNodeParams, GranularNodeProps } from './types';
import triangle from '/svg/triangle.svg';

function Section({
    label,
    summary,
    expanded,
    onToggle,
    children,
}: {
    label: string;
    summary?: string;
    expanded: boolean;
    onToggle: (v: boolean) => void;
    children: ReactNode;
}) {
    return (
        <ExpandableInputWrapper>
            <ExpandableInputLabel $expanded={expanded} onClick={() => onToggle(!expanded)}>
                <span>
                    {label}
                    {!expanded && summary && `: ${summary}`}
                </span>
                <Triangle $expanded={expanded} src={triangle} />
            </ExpandableInputLabel>
            {expanded && (
                <FlexContainer direction="column" gap={0}>
                    {children}
                </FlexContainer>
            )}
        </ExpandableInputWrapper>
    );
}

function GranularViz({ instance, width }: { instance: GranularNode; width: number }) {
    const wrapper = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const rafID = useRef(0);

    useEffect(() => {
        if (!canvas.current || !wrapper.current) return;
        const c = canvas.current.getContext('2d');
        if (!c) return;
        c.imageSmoothingEnabled = false;
        cancelAnimationFrame(rafID.current);

        canvas.current.width = wrapper.current.offsetWidth;
        canvas.current.height = wrapper.current.offsetHeight;

        function draw() {
            rafID.current = requestAnimationFrame(draw);
            if (!canvas.current) return;

            const width = canvas.current.width;
            const height = canvas.current.height;

            c!.fillStyle = '#000000';
            c!.fillRect(0, 0, width, height);

            const buffer = instance.getBuffer();
            if (buffer) {
                const data = buffer.getChannelData(0);
                const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
                const mid = height / 2;
                c!.fillStyle = 'rgb(130, 180, 209)';
                for (let x = 0; x < width; x++) {
                    const start = x * samplesPerPixel;
                    let min = 1;
                    let max = -1;
                    for (let i = 0; i < samplesPerPixel; i++) {
                        const v = data[start + i];
                        if (v < min) min = v;
                        if (v > max) max = v;
                    }
                    const top = Math.round(mid + min * mid);
                    const bottom = Math.max(top + 1, Math.round(mid + max * mid));
                    for (let y = top; y < bottom; y++) {
                        if (bayerThreshold(x, y) < 0.48) c!.fillRect(x, y, 1, 1);
                    }
                }
            }

            // spray/pan box: where new grains can currently spawn
            const posX = instance.params.position * width;
            const boxW = Math.round(instance.params.spray * width * 2);
            const boxH = Math.round(instance.params.pan * height);
            const boxX = Math.round(posX - boxW / 2);
            const boxY = Math.round((height - boxH) / 2);
            c!.fillStyle = 'rgba(0, 139, 219, 0.48)';
            c!.fillRect(boxX, boxY, boxW, boxH);

            c!.strokeStyle = '#ffffff';
            c!.beginPath();
            c!.moveTo(Math.round(posX) + 0.5, 0);
            c!.lineTo(Math.round(posX) + 0.5, height);
            c!.stroke();

            const now = audio.context.currentTime;
            for (const g of instance.getActiveGrains()) {
                const elapsed = now - g.spawnTime;
                let alpha = 1;
                if (elapsed < g.attackTime) {
                    alpha = g.attackTime > 0 ? elapsed / g.attackTime : 1;
                } else if (elapsed > g.life - g.decayTime) {
                    alpha = g.decayTime > 0 ? (g.life - elapsed) / g.decayTime : 0;
                }
                alpha = Math.max(0, Math.min(1, alpha));
                const x = g.x0 + g.speed * elapsed;

                c!.fillStyle = `rgba(0, 204, 255, ${alpha})`;
                c!.fillRect(Math.round(x * (width - 2)), Math.round(g.y * (height - 2)), 2, 2);
            }
        }

        draw();

        return () => cancelAnimationFrame(rafID.current);
    }, [instance, width]);

    return (
        <Background ref={wrapper}>
            <Canvas ref={canvas} />
        </Background>
    );
}

export function Granular({ id, data }: GranularNodeProps) {
    const [params, setParams] = useState<GranularNodeParams>({
        ...{
            playing: false,
            held: false,
            sourceMode: 'live',
            source: '',
            position: 0.5,
            seek: 0,
            spray: 0.2,
            size: 0.3,
            pitch: 1,
            pitchJitter: 0,
            direction: 1,
            pan: 1,
            density: 10,
            attack: 0.3,
            decay: 0.3,
            captureLength: 20,
            width: 4,
            expanded: {
                source: true,
                timing: true,
                grains: true,
                envelope: true,
                display: true,
            },
        },
        ...data.params,
    });

    const instance = useAudioNode(() => new GranularNode(audio.context));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);
    const [loadedFiles, setLoadedFiles] = useState<Map<string, AudioBuffer>>(new Map());
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [grainCount, setGrainCount] = useState(0);
    const audioInId = `${id}-in`;
    const audioOutId = `${id}-out`;
    const sockets: Socket[] = [
        { id: audioInId, label: '', type: 'target', edge: 'left', offset: 24 },
        { id: audioOutId, type: 'source', edge: 'right', offset: 24 },
    ];

    useEffect(() => {
        setInstance(audioInId, instance.recorder, 'target');
        setInstance(audioOutId, instance.output, 'source');
        instance.setParams(params);
        instance.setHold(params.held);
        instance.setLiveMode(params.sourceMode === 'live');
        if (params.playing) instance.start();

        const offPosition = instance.onPosition(position =>
            setParams(state => ({ ...state, position }))
        );

        const grainCountInterval = window.setInterval(
            () => setGrainCount(instance.getActiveGrains().length),
            150
        );

        return () => {
            instance.dispose();
            offPosition();
            clearInterval(grainCountInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadFile(file: File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = await audio.context.decodeAudioData(arrayBuffer);
        setLoadedFiles(state => new Map(state).set(file.name, buffer));
        setParams(state => ({ ...state, source: file.name }));
        instance.setStaticBuffer(buffer);
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) loadFile(file);
    }

    function handleSourceModeChange(sourceMode: 'live' | 'file') {
        instance.setLiveMode(sourceMode === 'live');
        setParams(state => ({ ...state, sourceMode }));

        if (sourceMode === 'file') {
            const buffer = loadedFiles.get(params.source);
            if (buffer) instance.setStaticBuffer(buffer);
        }
    }

    function handleSourceChange(source: string) {
        setParams(state => ({ ...state, source }));
        const buffer = loadedFiles.get(source);
        if (buffer) instance.setStaticBuffer(buffer);
    }

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    function sendParams(patch: Partial<GranularNodeParams>) {
        setParams(state => {
            const next = { ...state, ...patch };
            instance.setParams(next);
            return next;
        });
    }

    function togglePlaying() {
        const playing = !params.playing;
        playing ? instance.start() : instance.stop();
        setParams(state => ({ ...state, playing }));
    }

    function toggleHold() {
        const held = !params.held;
        instance.setHold(held);
        setParams(state => ({ ...state, held }));
    }

    function setSectionExpanded(key: string, v: boolean) {
        setParams(state => ({ ...state, expanded: { ...state.expanded, [key]: v } }));
    }

    const control = (key: keyof GranularNodeParams, label: string, min: number, max: number, step: number) => (
        <RangeInput
            label={label}
            value={params[key] as number}
            min={min}
            max={max}
            step={step}
            onChange={v => sendParams({ [key]: v } as Partial<GranularNodeParams>)}
            numberInput
            numberInputWidth={50}
        />
    );

    const Parameters = (
        <FlexContainer direction="column">
            <ButtonGroup>
                <GranularButton
                    className={`${params.playing && 'active'}`}
                    onClick={togglePlaying}
                    onMouseDownCapture={e => e.stopPropagation()}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    {params.playing ? 'Stop' : 'Play'}
                </GranularButton>
                {params.sourceMode === 'live' && (
                    <GranularButton
                        className={`${params.held && 'active'}`}
                        onClick={toggleHold}
                        onMouseDownCapture={e => e.stopPropagation()}
                        onPointerDownCapture={e => e.stopPropagation()}
                    >
                        Hold
                    </GranularButton>
                )}
            </ButtonGroup>
            <Hr />

            <Section
                label="Source"
                summary={params.sourceMode === 'live' ? 'Live input' : 'File'}
                expanded={params.expanded.source}
                onToggle={v => setSectionExpanded('source', v)}
            >
                <SelectInput
                    value={params.sourceMode}
                    onChange={e => handleSourceModeChange(e.target.value as 'live' | 'file')}
                    options={[
                        { value: 'live', label: 'Live input' },
                        { value: 'file', label: 'File' },
                    ]}
                />
                {params.sourceMode === 'file' && (
                    <>
                        {loadedFiles.size > 0 && (
                            <SelectInput
                                label="File:"
                                value={params.source}
                                onChange={e => handleSourceChange(e.target.value)}
                                options={Array.from(loadedFiles.keys()).map(name => ({
                                    value: name,
                                    label: name,
                                }))}
                            />
                        )}
                        <FlexContainer>
                            <GranularButton
                                onClick={() => fileInputRef.current?.click()}
                                onMouseDownCapture={e => e.stopPropagation()}
                                onPointerDownCapture={e => e.stopPropagation()}
                            >
                                Load file
                            </GranularButton>
                            <FileInput
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                            />
                        </FlexContainer>
                    </>
                )}
            </Section>
            <Hr />

            <Section
                label="Timing"
                expanded={params.expanded.timing}
                onToggle={v => setSectionExpanded('timing', v)}
            >
                {control('position', 'Position:', 0, 1, 0.01)}
                {control('seek', 'Seek (/s):', -1, 1, 0.01)}
                {params.sourceMode === 'live' &&
                    control('captureLength', 'Capture length (s):', 0.1, 20, 0.5)}
            </Section>
            <Hr />

            <Section
                label="Grains"
                expanded={params.expanded.grains}
                onToggle={v => setSectionExpanded('grains', v)}
            >
                {control('size', 'Size (s):', 0.01, 2, 0.01)}
                {control('density', 'Density (/s):', 1, 400, 1)}
                {control('pitch', 'Pitch:', 0.1, 4, 0.01)}
                {control('pitchJitter', 'Pitch jitter (cents):', 0, 100, 1)}
                {control('direction', 'Direction:', 0, 1, 0.01)}
                {control('spray', 'Spray:', 0, 1, 0.01)}
                {control('pan', 'Pan spread:', 0, 1, 0.01)}
            </Section>
            <Hr />

            <Section
                label="Envelope"
                summary={`${params.attack}/${params.decay}`}
                expanded={params.expanded.envelope}
                onToggle={v => setSectionExpanded('envelope', v)}
            >
                {control('attack', 'Attack:', 0, 1, 0.01)}
                {control('decay', 'Decay:', 0, 1, 0.01)}
            </Section>
            <Hr />

            <Section
                label="Display"
                summary={String(params.width)}
                expanded={params.expanded.display}
                onToggle={v => setSectionExpanded('display', v)}
            >
                {control('width', '', 1, 4, 1)}
            </Section>
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            name="Granular"
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
            constantSize
            optionsColor="white"
            valueColor="white"
            value={params.playing ? grainCount : ''}
            width={params.width * 3}
            parametersWidth={193}
            background={<GranularViz instance={instance} width={params.width} />}
        />
    );
}

const GranularButton = styled(PlayButton)`
    box-sizing: border-box;
`;

const FileInput = styled.input`
    display: none;
`;

const Background = styled.div`
    position: absolute;
    inset: 0;
    background-color: black;
`;

const Canvas = styled.canvas`
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
`;
