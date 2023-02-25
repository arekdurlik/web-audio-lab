import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'
import { clamp } from '../../helpers'

type NumberInputProps = {
  value?: number | string
  onChange?: (value: number) => void
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

  function checkBounds(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)
    
    const floatMin = typeof min === 'string' ? parseFloat(min) : min
    const floatMax = typeof max === 'string' ? parseFloat(max) : max
    
    
    if (value === undefined || Number.isNaN(value)) return
    const clamped = clamp(value, floatMin, floatMax)
    
    if (typeof onChange === 'function') onChange(clamped)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)
    if (typeof onChange === 'function') onChange(value)
  }
  return (
    <Wrapper >
      {label && <span>{label}: </span>}
      <Input 
        type='number' 
        step={step} 
        value={String(value)}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange} 
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