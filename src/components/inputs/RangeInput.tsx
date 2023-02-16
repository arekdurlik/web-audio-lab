import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'

type RangeInputProps = {
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label?: string
  defaultValue?: number
  min?: number | string
  max?: number | string
}
export function RangeInput({ label, value, min, max,  onChange }: RangeInputProps) {

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
      <Range 
        type='range' 
        step={0.0001} 
        value={value}
        min={min}
        max={max}
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

const Range = styled.input`
`

const Slider = styled.input`
margin-top: 15px;
margin-bottom: 15px;
-webkit-appearance: none;
width: 135px;
height: 1px;
background: #000;
outline: none;
opacity: 1;
-webkit-transition: .2s;
transition: opacity .2s;

&:hover {
  ::-webkit-slider-thumb {
    background-color: #000;
  }
}
::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 15px;
  background: #999;
  cursor: pointer;
  border-radius: 0;
}

::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #000;
  cursor: pointer;
}
`