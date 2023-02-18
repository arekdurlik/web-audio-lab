import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'

type RangeInputProps = {
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label?: string
  defaultValue?: number
  min?: number | string
  max?: number | string
  step?: number
  disabled?: boolean
}
export function RangeInput({ label, value, min, max, disabled, step = 0.01, onChange }: RangeInputProps) {

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

  return (
    <Wrapper>
      {label && <span>{label}: </span>}
      <input 
        type='range' 
        step={step} 
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onChange} 
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