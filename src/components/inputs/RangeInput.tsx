import { useEffect, ChangeEvent, MouseEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'
import { clamp } from '../../helpers'

type RangeInputProps = {
  value: number
  onChange?: (value: number) => void
  onChangeEnd?: (value: number) => void
  label?: string
  defaultValue?: number
  min?: number | string
  max?: number | string
  step?: number
  disabled?: boolean
}
export function RangeInput({ label, value, min, max, disabled, step = 0.01, onChange, onChangeEnd }: RangeInputProps) {

  useEffect(() => {
    const floatMin = typeof min === 'string' ? parseFloat(min) : min
    const floatMax = typeof max === 'string' ? parseFloat(max) : max

    let newValue = value

    if (floatMin && floatMax) {
      newValue = clamp(value, floatMin, floatMax)
    } 

    if (typeof onChange === 'function') onChange(newValue)
    if (typeof onChangeEnd === 'function') onChangeEnd(newValue)
  }, [min, max])
  
  function checkBounds(e: KeyboardEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)
    
    const floatMin = typeof min === 'string' ? parseFloat(min) : min
    const floatMax = typeof max === 'string' ? parseFloat(max) : max
    
    if (floatMax && value > floatMax) {
      target.value = String(max)
    } else if (floatMin && value < floatMin) {
      target.value = String(min)
    }
  }
  
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)

    if (typeof onChange === 'function') onChange(value)
  }

  function handleChangeEnd(e: MouseEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)

    if (typeof onChangeEnd === 'function') onChangeEnd(value)
  }

  return (
    <Wrapper>
      {label && <span>{label}: </span>}
      <input 
        type='range' 
        step={step} 
        value={String(value)}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange} 
        onMouseUp={handleChangeEnd}
        onKeyUp={checkBounds}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
display: flex;
gap: 10px;
`