import { ChangeEventHandler } from 'react'
import styled from 'styled-components'

type NumberInputProps = {
  id: string
  value?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  label: string
  disabled?: boolean
}
export function CheckboxInput({ id, label, value, disabled, onChange }: NumberInputProps) {
  return <CheckboxWrapper>
  <input type="checkbox" id={id} checked={value} onChange={onChange} disabled={disabled} />
  <label htmlFor={id}>{label}</label>
</CheckboxWrapper>
}

export const CheckboxWrapper = styled.div`
margin: 5px;
`