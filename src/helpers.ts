export function difference(a: number, b: number) {
  return Math.abs(a - b)
}

export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a))
}

/**
 * @returns a blend between x and y, based on a fraction a
 */
export function lerp(x: number, y: number, a: number) {
  return x * (1 - a) + y * a
}

/**
 * @returns a fraction a, based on a value between x and y
 */
export function invlerp(x: number, y: number, a: number) {
  return clamp((a - x) / (y - x))
}

export const normalize = (val: number, min: number, max: number) => {
  return (val - min) / (max - min)
}

export const curve = (val: number, min: number, max: number, curve: number) => { 
  const clamped = clamp(val, min, max)
  return (max - min) * (normalize(clamped, min, max) ** curve) + min
}