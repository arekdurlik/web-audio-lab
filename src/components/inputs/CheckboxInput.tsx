import { ChangeEventHandler } from 'react'

type NumberInputProps = {
  id: string
  value?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  label: string
  disabled?: boolean
}
export function CheckboxInput({ id, label, value, disabled, onChange }: NumberInputProps) {
  return <div>
  <input type="checkbox" id={id} checked={value} onChange={onChange} disabled={disabled} />
  <label htmlFor={id}>{label}</label>
</div>
}