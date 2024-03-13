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

export function range (x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return lerp(outMin, outMax, invlerp(inMin, inMax, x))
}

export function degToRad(value: number) {
  return value * (Math.PI/180)
}

export function countDecimals(value: string) {
  if (value.indexOf(".") !== -1) {
      return value.split(".")[1].length || 0
  } else {
    return 0
  }
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

export function waitForElement(selector: string): Promise<Element | null> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}