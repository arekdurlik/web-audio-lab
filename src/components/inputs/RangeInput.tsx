import { useEffect, ChangeEvent, MouseEvent, KeyboardEvent, CSSProperties, useState } from 'react'
import styled from 'styled-components'
import { clamp, countDecimals } from '../../helpers'
import { InputLabel, InputWrapper } from './styled'
import { NumberInput } from './NumberInput'
import { FlexContainer } from '../../styled'
import Log from './log'

type RangeInputProps = {
  value: number
  onChange?: (value: number) => void
  onMaxChange?: (value: number) => void
  onMinChange?: (value: number) => void
  label?: string
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  style?: CSSProperties
  logarithmic?: boolean
  adjustableBounds?: boolean
  numberInput?: boolean
  numberInputWidth?: number
}
export function RangeInput({ value, min = 0, max = 100, label, disabled, step = 0.01, numberInput, numberInputWidth, adjustableBounds, logarithmic, onChange, onMinChange, onMaxChange, style }: RangeInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const log = new Log({ minval: Math.max(1, min), maxval: max })

  useEffect(() => {
    if (logarithmic) {
      const pos = log.position(value)
      setInternalValue(pos)
    } else {
      setInternalValue(value)
    }
  }, [value])

  useEffect(() => {
    const newValue = clamp(value, min, max)

    if (typeof onChange === 'function') onChange(newValue)
  }, [min, max])

  function handleNumberChange(value: number) {
    if (typeof onChange === 'function') onChange(value)
  }

  function calculateValue(pos: number) {
    if (pos === 0) return 0
    if (pos === 1) return 1

    const decimals = countDecimals(step.toString())
    const value = log.value(pos).toFixed(decimals)
    return Number(value)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {

    if (logarithmic) {
      const newPosition = Number(e.target.value)
      setInternalValue(newPosition)

      if (typeof onChange === 'function') onChange(calculateValue(newPosition))
    } else {
      const target = e.target as HTMLInputElement
      const value = Number(target.value)

      if (typeof onChange === 'function') onChange(value)
    }
  }

  return <RangeInputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <FlexContainer gap={4}>
        <input 
          type='range' 
          step={step} 
          value={internalValue}
          min={logarithmic ? 0 : min}
          max={logarithmic ? 100 : max}
          disabled={disabled}
          onChange={handleChange} 
          onMouseDownCapture={(e) => e.stopPropagation()}
          onPointerDownCapture={(e) => e.stopPropagation()}
          style={style}
        />
        {numberInput && <NumberInput 
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleNumberChange} 
          width={numberInputWidth}
        />}
      </FlexContainer>
      {adjustableBounds && <FlexContainer
        justify='flex-end'
        gap={8}
        style={{ marginTop: 8 }}
    >
      <FlexContainer gap={2} align='center'>
        min:
        <NumberInput 
          width={50}
          onChange={onMinChange} 
          value={min}
        />
      </FlexContainer>
      <FlexContainer gap={2} align='center'>
        max:
        <NumberInput 
          width={50}
          onChange={onMaxChange}
          value={max}
        />
      </FlexContainer>
    </FlexContainer>}
    </RangeInputWrapper>
}

const RangeInputWrapper = styled(InputWrapper)`
flex: 1;
`