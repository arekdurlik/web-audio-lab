import { ChangeEventHandler, useRef } from 'react'
import styled from 'styled-components'
import triangle from '/svg/triangle.svg'
import { ExpandableInputContent, ExpandableInputLabel, ExpandableInputWrapper, Triangle } from './styled'

type SelectInputProps = {
  value?: number | string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  label?: string
  expanded?: boolean
  onExpandChange?: (value: boolean) => void
  options: { value: string, label: string }[]
}
export function SelectInput({ value, label, onChange, expanded, onExpandChange, options }: SelectInputProps) {
  const ref = useRef<HTMLSelectElement | null>(null)

  return (
    <ExpandableInputWrapper>
      {label && <ExpandableInputLabel 
        $expanded={expanded} 
        onClick={() => typeof onExpandChange === 'function' && onExpandChange(!expanded)} 
      >
        <Label>
          {label}
          {expanded !== undefined && !expanded && ' ' + options.find(o => o.value === value)?.label }
        </Label>
        {expanded !== undefined && <Triangle 
          $expanded={expanded} 
          src={triangle}/>}
      </ExpandableInputLabel>}
      <ExpandableInputContent $expanded={expanded ?? true}>
        <Input 
          ref={ref}
          value={value}
          onChange={onChange} 
          >
          {options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
        </Input>
      </ExpandableInputContent>
    </ExpandableInputWrapper>
  )
}

const Input = styled.select`
border-radius: 0;
outline: none;
max-width: 250px;
margin: 0 5px;
margin-bottom: 4px;
`

const Label = styled.span`
max-width: 170px;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
`