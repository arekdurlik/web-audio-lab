export function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
            .map(v =>
                Math.max(0, Math.min(255, Math.round(v)))
                    .toString(16)
                    .padStart(2, '0')
            )
            .join('')
    );
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d !== 0) {
        if (max === r) h = (((g - b) / d) % 6) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
        if (h < 0) h += 360;
    }

    const s = max === 0 ? 0 : d / max;
    const v = max;
    return [h, s, v];
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0,
        g = 0,
        b = 0;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// 4x4 Bayer ordered-dither matrix, normalized to (0,1)
const BAYER4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
].map(row => row.map(v => (v + 0.5) / 16));

export function bayerThreshold(x: number, y: number) {
    return BAYER4[y & 3][x & 3];
}

export function ditherChannel(value0to255: number, x: number, y: number, levels: number) {
    const steps = levels - 1;
    const scaled = (value0to255 / 255) * steps;
    const floor = Math.floor(scaled);
    const frac = scaled - floor;
    const level = frac > bayerThreshold(x, y) ? Math.min(steps, floor + 1) : floor;
    return Math.round((level / steps) * 255);
}

