/* Color */
export const surface = '#c0c0c0'
const button_highlight = '#ffffff'
export const button_face = '#dfdfdf'
const button_shadow = '#808080'
const window_frame = '#0a0a0a'
export const dialog_blue = '#000080'
const dialog_blue_light = '#1084d0'
const dialog_gray = '#808080'
const dialog_gray_light = '#b5b5b5'
const link_blue = '#0000ff'

/* Spacing */
const element_spacing = '8px'
const grouped_button_spacing = '4px'
const grouped_element_spacing = '6px'
const radio_width = '12px'
const checkbox_width = '13px'
const radio_label_spacing = '6px'
const range_track_height = '4px'
const range_spacing = '10px'

/* Borders */
const border_width = '1px'
const border_raised_outer = `inset -1px -1px ${window_frame}, inset 1px 1px ${button_highlight}`
const border_raised_inner = `inset -2px -2px ${button_shadow}, inset 2px 2px ${button_face}`
const border_sunken_outer = `inset -1px -1px ${button_highlight}, inset 1px 1px ${window_frame}`
const border_sunken_inner = `inset -2px -2px ${button_face}, inset 2px 2px ${button_shadow}`
const border_window_outer = `inset -1px -1px ${window_frame}, inset 1px 1px ${button_face}`
const border_window_inner = `inset -2px -2px ${button_shadow}, inset 2px 2px ${button_highlight}`


export const outsetBorder = `box-shadow: ${border_raised_outer}, ${border_raised_inner};`
export const insetBorder = `box-shadow: ${border_sunken_outer}, ${border_sunken_inner};`
export const windowBorder = `box-shadow: ${border_window_outer}, ${border_window_inner};`