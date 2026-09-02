import { ditherChannel, rgbToHex } from './components/ui/ColorPicker/color';

export function drawDithered(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    levels: number,
    colorAt: (x: number, y: number) => [number, number, number],
    pixelSize = 1,
    offsetX = 0,
    offsetY = 0
) {
    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const [r, g, b] = colorAt(x, y);
            const bx = (offsetX + x) / pixelSize;
            const by = (offsetY + y) / pixelSize;
            ctx.fillStyle = rgbToHex(
                ditherChannel(r, bx, by, levels),
                ditherChannel(g, bx, by, levels),
                ditherChannel(b, bx, by, levels)
            );
            ctx.fillRect(offsetX + x, offsetY + y, pixelSize, pixelSize);
        }
    }
}

const pixelTextCache = new Map<string, HTMLCanvasElement>();

// renders text once, then posterizes alpha to kill anti-aliased edge pixels,
// producing a crisp bitmap-font look regardless of the underlying font's hinting
function getPixelText(text: string, font: string, color: string): HTMLCanvasElement {
    const key = `${font}|${color}|${text}`;
    const cached = pixelTextCache.get(key);
    if (cached) return cached;

    const measurer = document.createElement('canvas').getContext('2d')!;
    measurer.font = font;
    const width = Math.ceil(measurer.measureText(text).width) + 2;
    const height = 12;

    const bitmap = document.createElement('canvas');
    bitmap.width = width;
    bitmap.height = height;
    const bctx = bitmap.getContext('2d')!;
    bctx.font = font;
    bctx.fillStyle = color;
    bctx.textBaseline = 'alphabetic';
    bctx.fillText(text, 0, height - 3);

    const imageData = bctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 3] = imageData.data[i + 3] >= 128 ? 255 : 0;
    }
    bctx.putImageData(imageData, 0, 0);

    pixelTextCache.set(key, bitmap);
    return bitmap;
}

export function drawPixelText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string,
    color: string
) {
    const bitmap = getPixelText(text, font, color);
    ctx.drawImage(bitmap, Math.round(x), Math.round(y - bitmap.height + 3));
}
