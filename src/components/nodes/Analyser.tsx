import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { convertFloatArrayToUint8, curve, invlerp } from '../../helpers';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { FlexContainer } from '../../styled';
import { bline } from '../FlowEditor/EdgeController/bezier';
import { CheckboxInput } from '../inputs/CheckboxInput';
import { RangeInput } from '../inputs/RangeInput';
import { SelectInput } from '../inputs/SelectInput';
import { Node } from './BaseNode';
import { Hr } from './BaseNode/styled';
import { Socket } from './BaseNode/types';
import { AnalyserParams, AnalyserProps, AnalyserType } from './types';

export function Analyser({ id, data }: AnalyserProps) {
    const [params, setParams] = useState<AnalyserParams>({
        ...{
            type: 'oscilloscope',
            scale: 1,
            width: 4,
            fitInScreen: false,
            expanded: { t: true, s: true, w: true },
        },
        ...data.params,
    });
    const scaleRef = useRef(params.scale);
    const widthRef = useRef(params.width);
    const fitInScreenRef = useRef(params.fitInScreen);

    const [instance] = useState(
        new AnalyserNode(audio.context, { smoothingTimeConstant: 0, fftSize: 2048 })
    );
    const [dataArray] = useState(new Float32Array(instance.frequencyBinCount));
    const setInstance = useNodeStore(state => state.setInstance);
    const { updateNode } = useUpdateFlowNode(id);
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const canvasWrapper = useRef<HTMLDivElement | null>(null);
    const [c, setC] = useState<CanvasRenderingContext2D | null>(null);
    const rafID = useRef(0);
    const imgData = useRef(new Uint8ClampedArray());
    let fps = 75,
        fpsInterval: number,
        now,
        then: number,
        elapsed;

    const audioId = `${id}-audio`;
    const sockets: Socket[] = [
        {
            id: audioId,
            label: '',
            type: 'target',
            edge: 'left',
            offset: [24, 24 * params.width, 24, 24 * params.width],
        },
        {
            id: audioId,
            label: '',
            type: 'source',
            edge: 'right',
            offset: [24, 24 * params.width, 24, 24 * params.width],
        },
    ];

    // get canvas context
    useEffect(() => {
        if (!canvas.current) return;

        setC(canvas.current.getContext('2d', { willReadFrequently: true }));
    }, [canvas]);

    // setup canvas
    useEffect(() => {
        if (!canvas.current || !c || !canvasWrapper.current) return;
        cancelAnimationFrame(rafID.current);

        canvas.current.width = canvasWrapper.current.offsetWidth;
        canvas.current.height = canvasWrapper.current.offsetHeight;
        c.fillStyle = '#000000';
        c.fillRect(0, 0, canvas.current.width, canvas.current.height);
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, canvas.current.height / 2);
        c.lineTo(canvas.current.width, canvas.current.height / 2);
        c.stroke();

        startDrawing();
    }, [canvas, c, canvasWrapper, params.type, params.width]);

    useEffect(() => {
        instance.connect(audio.context.destination);
        setInstance(audioId, instance, 'source');

        return () => {
            try {
                instance.disconnect(audio.context.destination);
                cancelAnimationFrame(rafID.current);
            } catch {}
        };
    }, []);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    function startDrawing() {
        fpsInterval = 1000 / fps;
        then = Date.now();

        params.type === 'oscilloscope'
            ? drawOscilloscope()
            : params.type === 'analyser'
            ? drawAnalyser()
            : drawVuMeter();
    }

    // check fps
    function checkFramePassed() {
        now = Date.now();
        elapsed = now - then;
        if (elapsed < fpsInterval) {
            return false;
        } else {
            then = now;
            return true;
        }
    }

    function setPixel(x: number, y: number) {
        if (canvas.current === null) return;
        var n = (y * canvas.current.width + x) * 4;
        imgData.current[n] = 0;
        imgData.current[n + 1] = 255;
        imgData.current[n + 2] = 0;
        imgData.current[n + 3] = 255;
    }

    function drawOscilloscope() {
        if (!canvas.current || !c) return;
        rafID.current = requestAnimationFrame(drawOscilloscope);

        if (!checkFramePassed()) return;

        instance.getFloatTimeDomainData(dataArray);
        const dbArray = convertFloatArrayToUint8(dataArray, [1, -1]);

        const segmentWidth =
            (canvas.current.width / instance.frequencyBinCount) *
            (fitInScreenRef.current ? widthRef.current : 4);
        c.fillRect(0, 0, canvas.current.width, canvas.current.height);

        c.strokeStyle = '#003300';
        for (let i = 1; i <= widthRef.current * 4; i++) {
            c.beginPath();
            c.moveTo(12 * i + 0.5, 0);
            c.lineTo(12 * i + 0.5, 200);
            c.stroke();
        }

        c.beginPath();
        c.moveTo(0, (canvas.current.height * 1) / 4 - 0.25);
        c.lineTo(canvas.current.width, (canvas.current.height * 1) / 4 - 0.25);
        c.stroke();

        c.beginPath();
        c.moveTo(0, (canvas.current.height * 2) / 4);
        c.lineTo(canvas.current.width, (canvas.current.height * 2) / 4);
        c.stroke();

        c.beginPath();
        c.moveTo(0, (canvas.current.height * 3) / 4 + 0.25);
        c.lineTo(canvas.current.width, (canvas.current.height * 3) / 4 + 0.25);
        c.stroke();

        const imageData = c.getImageData(0, 0, canvas.current.width, canvas.current.height);
        imgData.current = imageData.data as Uint8ClampedArray<ArrayBuffer>;

        const width =
            (instance.frequencyBinCount / (fitInScreenRef.current ? 1 : 4)) * widthRef.current;

        for (let i = 1; i < width; i += 1) {
            let x1 = (i * segmentWidth) / widthRef.current;
            let v1 = dbArray[i] / (128 / scaleRef.current) - (scaleRef.current - 1);
            let y1 = (v1 * canvas.current.height - 1) / 2;

            if (dbArray[i + 1] === undefined) continue;

            let x2 = ((i + 1) * segmentWidth) / widthRef.current;
            let v2 = dbArray[i + 1] / (128 / scaleRef.current) - (scaleRef.current - 1);
            let y2 = (v2 * canvas.current.height - 1) / 2;

            if (i > width - 8) continue;

            bline(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), setPixel);
        }

        c.putImageData(imageData, 0, 0);
    }

    function drawAnalyser() {
        if (!canvas.current || !c) return;
        rafID.current = requestAnimationFrame(drawAnalyser);

        if (!checkFramePassed()) return;

        instance.getFloatFrequencyData(dataArray);
        let dbArray = convertFloatArrayToUint8(dataArray, [
            instance.minDecibels,
            instance.maxDecibels,
        ]);

        const bars = 8 * widthRef.current;
        const gap = 1;

        const cwidth = canvas.current.width;
        const cheight = canvas.current.height;
        const meterWidth = 5;

        const gradient = c.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(1, `rgb(0, 255, 0)`);
        gradient.addColorStop(0.075, `rgb(0, 255, 0)`);
        gradient.addColorStop(0.074, `rgb(255, 0, 0)`);
        gradient.addColorStop(0, `rgb(255, 0, 0)`);

        c.fillStyle = '#000000';
        c.fillRect(0, 0, cwidth, cheight);

        // get samples logarithmically
        const length = dbArray.length;
        const values = [];

        for (let i = 0; i < length; i++) {
            values.push(Math.floor(curve(i, 0, length, 30)));
        }

        const unique = [...new Set(values)];

        // draw bars
        for (let i = 0; i < bars; i++) {
            const value = dbArray[unique[Math.floor(i * (length / (7.5 * bars)))]];

            c.fillStyle = gradient;
            c.fillRect(i * meterWidth + i * gap, cheight, meterWidth, cheight - value + 100);
        }
    }

    function drawVuMeter() {
        if (!canvas.current || !c) return;
        rafID.current = requestAnimationFrame(drawVuMeter);

        if (!checkFramePassed()) return;

        instance.getFloatTimeDomainData(dataArray);

        let sumOfSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sumOfSquares += dataArray[i] ** 2;
        }
        const avgPowerDecibels = 10 * Math.log10(sumOfSquares / dataArray.length);
        const cwidth = canvas.current.width;
        const cheight = canvas.current.height;

        c.fillStyle = '#000000';
        c.fillRect(0, 0, cwidth, cheight);

        c.font = '11px Pixelated MS Sans Serif';
        c.fillStyle = '#aaa';
        const h = cheight - 3;
        switch (widthRef.current) {
            case 1:
                c.fillText('-30', cwidth * 0.006, h);
                c.fillText('0', cwidth * 0.82, h);

                c.fillStyle = '#777';
                c.fillRect(cwidth * 0.82 + 3.5, 0, 3, cheight - 20);
                break;
            case 2:
                c.fillText('-30', cwidth * 0.001, h);
                c.fillText('-15', cwidth * 0.304, h);
                c.fillText('-7', cwidth * 0.6, h);
                c.fillText('0', cwidth * 0.8494, h);

                c.fillStyle = '#777';
                c.fillRect(cwidth * 0.854 + 3, 0, 3, cheight - 20);
                break;
            case 3:
                c.fillText('-30', cwidth * 0.001, h);
                c.fillText('-20', cwidth * 0.225, h);
                c.fillText('-10', cwidth * 0.527, h);
                c.fillText('-5', cwidth * 0.695, h);
                c.fillText('0', cwidth * 0.865, h);
                c.fillText('dB', cwidth * 0.919, h);

                c.fillStyle = '#777';
                c.fillRect(cwidth * 0.865 + 3.5, 0, 3, cheight - 20);
                break;
            case 4:
                c.fillText('-30', cwidth * 0.001, h);
                c.fillText('-20', cwidth * 0.246, h);
                c.fillText('-10', cwidth * 0.544, h);
                c.fillText('-5', cwidth * 0.701, h);
                c.fillText('0', cwidth * 0.87, h);
                c.fillText('dB', cwidth * 0.939, h);

                c.fillStyle = '#777';
                c.fillRect(cwidth * 0.8675 + 3.5, 0, 3, cheight - 20);
                break;
        }

        const gradient = c.createLinearGradient(cwidth, 0, 0, 0);
        gradient.addColorStop(1, `rgb(0, 255, 0)`);
        gradient.addColorStop(0.119, `rgb(0, 255, 0)`);
        gradient.addColorStop(0.118, `rgb(255, 0, 0)`);
        gradient.addColorStop(0, `rgb(255, 0, 0)`);
        c.fillStyle = gradient;
        c.fillRect(0, 0, cwidth * invlerp(-30, 4, avgPowerDecibels), cheight - 20);
    }

    const Parameters = (
        <FlexContainer direction="column">
            <SelectInput
                label="Type:"
                value={params.type}
                onChange={e =>
                    setParams(state => ({ ...state, type: e.target.value as AnalyserType }))
                }
                options={[
                    { value: 'oscilloscope', label: 'Oscilloscope' },
                    { value: 'analyser', label: 'Spectrum analyser' },
                    { value: 'vu-meter', label: 'VU Meter' },
                ]}
                expanded={params.expanded.t}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, t: v } }))
                }
            />
            {params.type === 'oscilloscope' && (
                <>
                    <Hr />
                    <RangeInput
                        label="Scale:"
                        value={params.scale}
                        onChange={v => {
                            setParams(state => ({ ...state, scale: v }));
                            scaleRef.current = v;
                        }}
                        min={0}
                        max={10}
                        step={0.01}
                        numberInput
                        expanded={params.expanded.s}
                        onExpandChange={v =>
                            setParams(state => ({
                                ...state,
                                expanded: { ...state.expanded, s: v },
                            }))
                        }
                    />
                </>
            )}
            <Hr />
            <RangeInput
                label="Width:"
                value={params.width}
                onChange={v => {
                    setParams(state => ({ ...state, width: v }));
                    widthRef.current = v;
                }}
                min={1}
                max={4}
                step={1}
                numberInput
                expanded={params.expanded.w}
                onExpandChange={v =>
                    setParams(state => ({ ...state, expanded: { ...state.expanded, w: v } }))
                }
            />
            {params.type === 'oscilloscope' && (
                <>
                    <Hr />
                    <CheckboxInput
                        id={`${id}-fit`}
                        label="Fit in screen"
                        value={params.fitInScreen}
                        onChange={() => {
                            setParams(state => ({ ...state, fitInScreen: !state.fitInScreen }));
                            fitInScreenRef.current = !fitInScreenRef.current;
                        }}
                    />
                </>
            )}
        </FlexContainer>
    );

    return (
        <Node
            id={id}
            data={data}
            sockets={sockets}
            parameterPositions={['bottom', 'left', 'top', 'right']}
            parameters={Parameters}
            optionsColor="white"
            constantSize
            valueColor={params.type === 'oscilloscope' ? '#00ffff' : '#ff0000'}
            value={params.type === 'oscilloscope' ? params.scale : undefined}
            valueUnit={params.type === 'oscilloscope' ? 'x' : undefined}
            width={params.width * 3}
            parametersWidth={193}
            borderColor="#003300"
            background={
                <Background ref={canvasWrapper}>
                    <Canvas ref={canvas} />
                </Background>
            }
        />
    );
}

export const Canvas = styled.canvas`
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
`;
export const Background = styled.div`
    position: absolute;
    inset: 0;
    background-color: black;
`;
