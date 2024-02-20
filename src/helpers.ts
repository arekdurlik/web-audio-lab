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

export function normalize (val: number, min: number, max: number) {
  return (val - min) / (max - min)
}

export function curve (val: number, min: number, max: number, curve: number) { 
  const clamped = clamp(val, min, max)
  return (max - min) * (normalize(clamped, min, max) ** curve) + min
}

export function range (x1: number, y1: number, x2: number, y2: number, a: number) {
  return lerp(x2, y2, invlerp(x1, y1, a))
}

export function convertFloatArrayToUint8(floatArray: Float32Array, inputRange: [number, number], outputRange = [0, 255]) {
  const uintArray = new Uint8Array(floatArray.length)

  const inputMin = inputRange[0]
  const inputMax = inputRange[1]
  const outputMin = outputRange[0]
  const outputMax = outputRange[1]

  const inputRangeSize = inputMax - inputMin
  const outputRangeSize = outputMax - outputMin

  for (let i = 0; i < floatArray.length; i++) {
      // scale float value to output range
      const scaledValue = (floatArray[i] - inputMin) / inputRangeSize * outputRangeSize + outputMin

      // ensure the value is within the output range
      uintArray[i] = Math.max(outputMin, Math.min(outputMax, scaledValue))
  }
  return uintArray
}