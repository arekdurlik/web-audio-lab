import { ditherChannel, rgbToHex } from './components/ui/ColorPicker/color';

export function drawDithered(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    levels: number,
    colorAt: (x: number, y: number) => [number, number, number]
) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [r, g, b] = colorAt(x, y);
            ctx.fillStyle = rgbToHex(
                ditherChannel(r, x, y, levels),
                ditherChannel(g, x, y, levels),
                ditherChannel(b, x, y, levels)
            );
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
