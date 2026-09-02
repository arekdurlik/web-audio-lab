import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { fieldBorder, surface, windowBorder } from '../../../98';
import { drawDithered } from '../../../canvas';
import { useOutsideClick } from '../../../hooks/useOutsideClick';
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from './color';

const SV_SIZE = 64;
const SV_SCALE = 1;
const HUE_WIDTH = 64;
const HUE_HEIGHT = 4;
const HUE_SCALE = 1;
const LEVELS = 6;

type ColorPickerProps = {
    value: string;
    onChange: (hex: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [open, setOpen] = useState(false);
    const [hue, setHue] = useState(0);
    const [sat, setSat] = useState(0);
    const [val, setVal] = useState(0);
    const [hexText, setHexText] = useState(value);
    const dragging = useRef<'sv' | 'hue' | null>(null);
    const svCanvasRef = useRef<HTMLCanvasElement>(null);
    const hueCanvasRef = useRef<HTMLCanvasElement>(null);
    const activator = useOutsideClick(() => setOpen(false));

    useEffect(() => {
        const [r, g, b] = hexToRgb(value);
        const [h, s, v] = rgbToHsv(r, g, b);
        setHue(h);
        setSat(s);
        setVal(v);
        setHexText(value);
    }, [value]);

    useEffect(() => {
        const canvas = svCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawDithered(ctx, SV_SIZE, SV_SIZE, LEVELS, (x, y) => {
            const s = x / (SV_SIZE - 1);
            const v = 1 - y / (SV_SIZE - 1);
            return hsvToRgb(hue, s, v);
        });
    }, [hue, open]);

    useEffect(() => {
        const canvas = hueCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawDithered(ctx, HUE_WIDTH, HUE_HEIGHT, LEVELS, x => {
            const h = (x / (HUE_WIDTH - 1)) * 360;
            return hsvToRgb(h, 1, 1);
        });
    }, [open]);

    function commit(h: number, s: number, v: number) {
        const [r, g, b] = hsvToRgb(h, s, v);
        onChange(rgbToHex(r, g, b));
    }

    function handleHexChange(raw: string) {
        setHexText(raw);
        const match = raw.match(/^#?([0-9a-fA-F]{6})$/);
        if (match) onChange(`#${match[1]}`);
    }

    function handleSVPointer(e: React.PointerEvent<HTMLCanvasElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const s = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const v = 1 - Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        setSat(s);
        setVal(v);
        commit(hue, s, v);
    }

    function handleHuePointer(e: React.PointerEvent<HTMLCanvasElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const h = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * 360;
        setHue(h);
        commit(h, sat, val);
    }

    function startDrag(
        type: 'sv' | 'hue',
        handler: (e: React.PointerEvent<HTMLCanvasElement>) => void
    ) {
        return (e: React.PointerEvent<HTMLCanvasElement>) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = type;
            handler(e);
        };
    }

    return (
        <Wrapper ref={activator}>
            <Trigger
                type="button"
                style={{ backgroundColor: value }}
                onClick={() => setOpen(state => !state)}
            />
            {open && (
                <Popover>
                    <SVBox>
                        <SVInner>
                            <SVCanvas
                                ref={svCanvasRef}
                                width={SV_SIZE}
                                height={SV_SIZE}
                                onPointerDown={startDrag('sv', handleSVPointer)}
                                onPointerMove={e => dragging.current === 'sv' && handleSVPointer(e)}
                                onPointerUp={() => (dragging.current = null)}
                            />
                            <Cursor style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }} />
                        </SVInner>
                    </SVBox>
                    <HueBox>
                        <HueInner>
                            <HueCanvas
                                ref={hueCanvasRef}
                                width={HUE_WIDTH}
                                height={HUE_HEIGHT}
                                onPointerDown={startDrag('hue', handleHuePointer)}
                                onPointerMove={e =>
                                    dragging.current === 'hue' && handleHuePointer(e)
                                }
                                onPointerUp={() => (dragging.current = null)}
                            />
                            <HueCursor style={{ left: `${(hue / 360) * 100}%` }} />
                        </HueInner>
                    </HueBox>
                    <HexInput
                        type="text"
                        value={hexText}
                        spellCheck={false}
                        onChange={e => handleHexChange(e.target.value)}
                        onMouseDownCapture={e => e.stopPropagation()}
                        onPointerDownCapture={e => e.stopPropagation()}
                    />
                </Popover>
            )}
        </Wrapper>
    );
}

const Wrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const Trigger = styled.button`
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    padding: 2px;
    border: none;
    border-radius: 0;
    min-width: unset;
    min-height: unset;
    cursor: pointer;
    background-clip: padding-box;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    image-rendering: pixelated;
    ${fieldBorder}
`;

const Popover = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 2px;
    ${windowBorder}
    background: ${surface};
    padding: 6px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const HexInput = styled.input`
    box-sizing: border-box;
    width: ${SV_SIZE * SV_SCALE + 4}px;
    border: none;
    border-radius: 0;
    outline: none;
    text-align: center;
    padding: 2px;
    margin: 0;
    ${fieldBorder}
`;

const SVBox = styled.div`
    display: inline-block;
    padding: 2px;
    ${fieldBorder}
`;

const SVInner = styled.div`
    position: relative;
    width: ${SV_SIZE * SV_SCALE}px;
    height: ${SV_SIZE * SV_SCALE}px;
`;

const SVCanvas = styled.canvas`
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    cursor: crosshair;
    display: block;
`;

const HueBox = styled.div`
    display: inline-block;
    padding: 2px;
    ${fieldBorder}
`;

const HueInner = styled.div`
    position: relative;
    width: ${SV_SIZE * SV_SCALE}px;
    height: ${HUE_HEIGHT * HUE_SCALE}px;
`;

const HueCanvas = styled.canvas`
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    cursor: ew-resize;
    display: block;
`;

const Cursor = styled.div`
    position: absolute;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    image-rendering: pixelated;
    background-image: url('icons/color_picker_circle.png');
    background-size: contain;
`;

const HueCursor = styled.div`
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    image-rendering: pixelated;
    background-image: url('icons/color_picker_rectangle.png');
    background-size: 8px 8px;
    background-repeat: no-repeat;
    background-position: center;
`;
