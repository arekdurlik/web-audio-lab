import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Log from './log'

type RangeInputProps = {
  value: number
  onChange: (newValues: { position: number, value: number }) => void
  label?: string
  defaultValue?: number
  disabled?: boolean

  minval?: number
  maxval?: number
  minpos?: number
  maxpos?: number
}
export function LogRangeInput({ value, label, disabled, minval = 1, maxval = 100, minpos = 0, maxpos = 100, onChange }: RangeInputProps) {
  const [position, setPosition] = useState(0)
  const dragging = useRef(false)
  const log = new Log({
    minval,
    maxval,
    minpos,
    maxpos
  })

  useEffect(() => {
    if (dragging.current || !value || Number.isNaN(value)) return
    const pos = log.position(value)
    setPosition(pos)
  }, [value])

  function calculateValue(pos: number) {
    if (pos === 0) return 0
    if (pos === 1) return minval

    const value = log.value(pos)
    return Math.round(value * 100) / 100
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newPosition = Math.max(1, parseFloat(e.target.value))

    setPosition(newPosition)
    const newVals = {
      position: newPosition,
      value: calculateValue(newPosition)
    }
    onChange(newVals)
  }

  return (
    <Wrapper>
      {label && <span>{label}: </span>}
      <input 
        type='range' 
        step={0.01} 
        value={position}
        min={minpos}
        max={maxpos}
        disabled={disabled}
    
        onPointerUp={() => {
          dragging.current = false
        }}
        onChange={handleChange} 
        onMouseDownCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => {
          e.stopPropagation()
          dragging.current = true
        }}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
display: flex;
gap: 10px;
`