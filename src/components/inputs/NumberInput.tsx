import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'

type NumberInputProps = {
  value?: number | string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  label?: string
  defaultValue?: number
  min?: number | string
  max?: number | string
  step?: number
  width?: number
  disabled?: boolean
  unit?: string
}
export function NumberInput({ label, value, min, max, step = 0.01, width = 60, unit, disabled, onChange }: NumberInputProps) {

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
    <Wrapper >
      {label && <span>{label}: </span>}
      <Input 
        type='number' 
        step={step} 
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onChange} 
        onKeyUp={checkBounds}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        width={width}
      />
      {unit}
    </Wrapper>
  )
}

const Wrapper = styled.div`
display: flex;
gap: 5px;
align-items: center;
justify-content: space-between;
`

const Input = styled.input<{ width?: number }>`
border-radius: 0;
border: 1px solid #000;
outline: none;
z-index: 500;
max-width: ${({ width }) => width }px;
`