import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'

type NumberInputProps = {
  label?: string
  defaultValue?: number
  min?: number
  max?: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}
export function NumberInput({ label, defaultValue, min = 0, max = 1,  onChange }: NumberInputProps) {

  function checkBounds(e: KeyboardEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = parseFloat(target.value)

   if (value > max) {
    target.value = String(max)
   } else if (value < min) {
    target.value = String(min)
   }
  }

  return (
    <Wrapper>
      {label && <span>{label}</span>}
      <Input 
        type='number' 
        step={0.01} 
        defaultValue={defaultValue}
        min={min}
        max={max}
        onKeyUp={checkBounds}
        onChange={onChange} 
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
display: flex;
flex-direction: column;
gap: 5px;
`

const Input = styled.input`
border-radius: 0;
border: 1px solid #000;
outline: none;
z-index: 500;
`