import { ChangeEventHandler } from 'react'
import styled from 'styled-components'
import { InputLabel, InputWrapper } from './styled'

type SelectInputProps = {
  value?: number | string
  label?: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  children: React.ReactNode
}
export function SelectInput({ value, label, onChange, children }: SelectInputProps) {

  return (
    <InputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <Input 
        value={value}
        onChange={onChange} 
      >
        {children}
      </Input>
    </InputWrapper>
  )
}

const Input = styled.select`
border-radius: 0;
outline: none;
`