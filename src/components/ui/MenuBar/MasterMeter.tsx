import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fieldBorder } from '../../../98';
import { drawDithered } from '../../../canvas';
import { hsvToRgb } from '../ColorPicker/color';
import { invlerp, lerp } from '../../../helpers';
import { audio } from '../../../main';

const LEVELS = 6;

export function MasterMeter() {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const rafID = useRef(0);
    const dataArrayRef = useRef(new Float32Array(audio.meter.fftSize));

    useEffect(() => {
        if (!canvas.current) return;
        const c = canvas.current.getContext('2d');
        if (!c) return;

        function draw() {
            rafID.current = requestAnimationFrame(draw);
            if (!canvas.current) return;

            audio.meter.getFloatTimeDomainData(dataArrayRef.current);
            let sumOfSquares = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                sumOfSquares += dataArrayRef.current[i] ** 2;
            }
            const db = 10 * Math.log10(sumOfSquares / dataArrayRef.current.length);

            const cwidth = canvas.current.width;
            const cheight = canvas.current.height;

            c!.fillStyle = '#000000';
            c!.fillRect(0, 0, cwidth, cheight);

            const activeWidth = Math.round(cwidth * invlerp(-30, 4, db));

            drawDithered(c!, activeWidth, cheight, LEVELS, x => {
                const hue = Math.max(0, lerp(120, 0, x / (cwidth * 0.88)));
                return hsvToRgb(hue, 1, 1);
            });
        }

        draw();

        return () => cancelAnimationFrame(rafID.current);
    }, []);

    return (
        <Container>
            <MeterBox>
                <MeterInner>
                    <Canvas ref={canvas} width={60} height={12} />
                </MeterInner>
            </MeterBox>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 1px 4px;
`;

const MeterBox = styled.div`
    display: inline-block;
    padding: 2px;
    ${fieldBorder}
`;

const MeterInner = styled.div`
    position: relative;
    width: 60px;
    height: 12px;
`;

const Canvas = styled.canvas`
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    display: block;
`;
