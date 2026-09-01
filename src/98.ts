/* Themeable colors — these map onto 98.css's own CSS custom properties
   (--surface, --button-highlight, etc.) so that everything 98.css itself
   styles with those vars, like the scrollbar, recolors too. */
export const themeVarNames = {
    surface: '--surface',
    highlight: '--button-highlight',
    face: '--button-face',
    shadow: '--button-shadow',
    frame: '--window-frame',
    text: '--wac-text',
} as const;

export const themeDefaults = {
    surface: '#c0c0c0',
    highlight: '#ffffff',
    face: '#dfdfdf',
    shadow: '#808080',
    frame: '#0a0a0a',
    text: '#000000',
} as const;

export type ThemeColors = typeof themeDefaults;

/* The 98.css scrollbar track/buttons are baked raster-ish SVG assets with
   hardcoded colors (not CSS vars), so recoloring them means rebuilding the
   same pixel-art with the current theme colors and swapping the asset. */
function bevelButton(theme: ThemeColors, arrow: string) {
    return `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill="${theme.face}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill="${theme.highlight}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill="${theme.frame}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill="${theme.shadow}"/>
<rect x="2" y="2" width="12" height="13" fill="${theme.surface}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="${arrow}" fill="${theme.frame}"/>
</svg>`;
}

const arrows = {
    up: 'M8 6H7V7H6V8H5V9H4V10H11V9H10V8H9V7H8V6Z',
    down: 'M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z',
    left: 'M9 4H8V5H7V6H6V7H5V8H6V9H7V10H8V11H9V4Z',
    right: 'M7 4H6V11H7V10H8V9H9V8H10V7H9V6H8V5H7V4Z',
};

function svgToUrl(svg: string) {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function ditherPattern(colorA: string, colorB: string) {
    return `<svg width="2" height="2" viewBox="0 0 2 2" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 0H0V1H1V2H2V1H1V0Z" fill="${colorA}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2 0H1V1H0V2H1V1H2V0Z" fill="${colorB}"/>
</svg>`;
}

export function buildScrollbarAssets(theme: ThemeColors) {
    return {
        track: svgToUrl(ditherPattern(theme.surface, theme.highlight)),
        up: svgToUrl(bevelButton(theme, arrows.up)),
        down: svgToUrl(bevelButton(theme, arrows.down)),
        left: svgToUrl(bevelButton(theme, arrows.left)),
        right: svgToUrl(bevelButton(theme, arrows.right)),
    };
}

export const scrollbarVarNames = {
    track: '--scrollbar-track-bg',
    up: '--scrollbar-btn-up',
    down: '--scrollbar-btn-down',
    left: '--scrollbar-btn-left',
    right: '--scrollbar-btn-right',
} as const;

/* Hover dither: checkerboard between the base surface and the current
   face/highlight color, same 2x2 pixel-art technique as the scrollbar track. */
export function buildHoverAssets(theme: ThemeColors) {
    return {
        hover: svgToUrl(ditherPattern(theme.surface, theme.face)),
    };
}

export const hoverVarNames = {
    hover: '--hover-dither',
} as const;

/* input[type=range] thumb icons — same baked-SVG situation as the scrollbar
   buttons, so they get rebuilt from the theme too. */
export function buildRangeAssets(theme: ThemeColors) {
    const thumb = `<svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0V16H2V18H4V20H5V19H3V17H1V1H10V0Z" fill="${theme.highlight}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1V16H2V17H3V18H4V19H6V18H7V17H8V16H9V1Z" fill="${theme.surface}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9 1H10V16H8V18H6V20H5V19H7V17H9Z" fill="${theme.shadow}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H11V16H9V18H7V20H5V21H6V19H8V17H10Z" fill="${theme.frame}"/>
</svg>`;

    const thumbBox = `<svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0V20H1V1H10V0Z" fill="${theme.highlight}"/>
<rect x="1" y="1" width="8" height="18" fill="${theme.surface}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9 1H10V20H1V19H9Z" fill="${theme.shadow}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H11V21H0V20H10Z" fill="${theme.frame}"/>
</svg>`;

    return {
        thumb: svgToUrl(thumb),
        thumbBox: svgToUrl(thumbBox),
    };
}

export const rangeVarNames = {
    thumb: '--range-thumb',
    thumbBox: '--range-thumb-box',
} as const;

/* Color */
export const surface = 'var(--surface, #c0c0c0)';
export const button_highlight = 'var(--button-highlight, #ffffff)';
export const button_face = 'var(--button-face, #dfdfdf)';
export const button_shadow = 'var(--button-shadow, #808080)';
export const window_frame = 'var(--window-frame, #0a0a0a)';
export const text_color = 'var(--wac-text, #000000)';
export const dialog_blue = '#000080';
const dialog_blue_light = '#1084d0';
const dialog_gray = '#808080';
const dialog_gray_light = '#b5b5b5';
const link_blue = '#0000ff';

/* Spacing */
const element_spacing = '8px';
const grouped_button_spacing = '4px';
const grouped_element_spacing = '6px';
const radio_width = '12px';
const checkbox_width = '13px';
const radio_label_spacing = '6px';
const range_track_height = '4px';
const range_spacing = '10px';

/* Borders */
const border_width = '1px';
const border_raised_outer = `inset -1px -1px ${window_frame}, inset 1px 1px ${button_highlight}`;
const border_raised_inner = `inset -2px -2px ${button_shadow}, inset 2px 2px ${button_face}`;
const border_sunken_outer = `inset -1px -1px ${button_highlight}, inset 1px 1px ${window_frame}`;
const border_sunken_inner = `inset -2px -2px ${button_face}, inset 2px 2px ${button_shadow}`;
const border_window_outer = `inset -1px -1px ${window_frame}, inset 1px 1px ${button_face}`;
const border_window_inner = `inset -2px -2px ${button_shadow}, inset 2px 2px ${button_highlight}`;
const border_field = `inset -1px -1px ${button_highlight}, inset 1px 1px ${button_shadow}, inset -2px -2px ${button_face}, inset 2px 2px ${window_frame}`;

export const outsetBorder = `box-shadow: ${border_raised_outer}, ${border_raised_inner};`;
export const insetBorder = `box-shadow: ${border_sunken_outer}, ${border_sunken_inner};`;
export const windowBorder = `box-shadow: ${border_window_outer}, ${border_window_inner};`;
export const fieldBorder = `box-shadow: ${border_field};`;
