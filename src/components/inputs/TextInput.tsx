import { ChangeEvent, KeyboardEvent } from 'react'
import styled from 'styled-components'
import { clamp } from '../../helpers'
import { InputLabel } from './styled'

type TextInputProps = {
  value?: number | string
  onChange?: (value: string) => void
  label?: string
  defaultValue?: number
  width?: number
  disabled?: boolean
  error?: boolean
  errorMessage?: string
}
export function TextInput({ label, value, width, disabled, error, errorMessage, onChange }: TextInputProps) {

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = target.value
    if (typeof onChange === 'function') onChange(value)
  }

  return (
    <TextInputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <Input 
        type='text' 
        value={String(value)}
        disabled={disabled}
        onChange={handleChange} 
        width={width}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        spellCheck={false}
        error={error}
      />
      {error && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </TextInputWrapper>
  )
}

export const TextInputWrapper = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
`

const Input = styled.input<{ width?: number, error?: boolean }>`
border-radius: 0;
border: 1px solid #000;
outline: none;
z-index: 500;
margin-left: 5px;
margin-right: 5px;

${({ width }) => width && `max-width: ${width}px; min-width: ${width}px;`}
${({ error }) => error && 'border-color: red;'}
`

const ErrorMessage = styled.span`
color: red;
`