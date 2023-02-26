import { WaveShaperProps } from './types'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { useReactFlow } from 'reactflow'
import styled from 'styled-components'
import { Select } from '../inputs/styled'
import { NumberInput } from '../inputs/NumberInput'
import { RangeInput } from '../inputs/RangeInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

export function WaveShaper({ id, data }: WaveShaperProps) {
  const [variable, setVariable] = useState(data.variable ?? false)
  const [amount, setAmount] = useState(data.amount ?? 30)
  const [equation, setEquation] = useState(data.equation ?? '(3 + 20) * x * 57 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x))')
  const [oversample, setOversample] = useState<OverSampleType>(data.oversample ?? 'none')
  const [error, setError] = useState(false)

  const audioId = `${id}-audio`
  const instance = useRef(new WaveShaperNode(audio.context, { oversample: data.oversample }))
  const input = useRef<HTMLInputElement | null>(null)
  const setInstance = useNodeStore(state => state.setInstance)
  const reactFlowInstance = useReactFlow()
  const { updateNode } = useUpdateFlowNode(id)
  const sockets: Socket[] = [
    {
      id: audioId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: 24
    },
    {
      id: audioId,
      type: 'source',
      edge: 'right',
      offset: 24
    }
  ]

  // init
  useEffect(() => {
    setInstance(audioId, instance.current, 'source')
    handleApply()
  }, [])

  // update curve in variable mode whenever amount changed
  useEffect(() => {
    if (!variable) return
    instance.current.curve = makeDistortionCurve()
  }, [amount])

  // update reactflow data
  useEffect(() => {
    updateNode({ oversample, variable, amount, equation })
  }, [oversample, variable, amount, equation])

  function makeDistortionCurve() {
    const nSamples = audio.context.sampleRate
    const curve = new Float32Array(nSamples)

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1

      let newEquation = equation.slice().replaceAll('x', String(x))

      if (variable) {
        equation.replaceAll('a', String(amount))
      }
      
      // TODO: evaln't
      let a = amount
      curve[i] = eval(newEquation)
    }
    return curve
  }

  function handleApply() {
    try {
      const slice = equation.slice()
      
      if (variable) {
        slice.replaceAll('a', String(amount))
      }

      let x, a
      const num = eval(slice)
      // throw if equation doesn't return number
      num.toFixed(1)

      setError(false)
      instance.current.curve = makeDistortionCurve()
    } catch (e) {
      console.error(e)
      setError(true)
    }
  }

  function handleEquation(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setEquation(value)
  }

  function handleOversample(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as OverSampleType
    setOversample(value)
    instance.current.oversample = value
  }

  const Parameters = <FlexContainer 
    direction='column' 
    gap={8}
  >
      <div>
        Oversample:
        <Parameter>
        <Select 
          value={oversample}
          onChange={handleOversample} 
        >
          <option value='none'>None</option>
          <option value='2x'>2x</option>
          <option value='4x'>4x</option>
        </Select>
        </Parameter>
      </div>
      <div>
        Variable:
        <input 
          type='checkbox' 
          checked={variable} 
          onChange={() => setVariable(!variable)}
        />
      </div>
    {variable ? <div>
      Amount:
      <Parameter>
        <RangeInput
          max={1000}
          onChange={setAmount}
          value={amount}
          />
        <NumberInput 
          max={1000}
          onChange={setAmount} 
          value={amount}
        />
      </Parameter>
    </div> : ''}
    <div>
    Equation:
    {variable ? <><br/>Let <b>a</b> be the amount of distortion.</> : ''}
    <FlexContainer
      direction='column'
      gap={8}
    >
      <Parameter>
        <EquationInput
          value={equation}
          onChange={handleEquation} 
          error={error}
          ref={input}
          onPointerDownCapture={e => { e.stopPropagation() }}
          onMouseDownCapture={e => { e.stopPropagation() }}
          />
      </Parameter>
    </FlexContainer>
    </div>
    <FlexContainer>
      <button onClick={handleApply}>Apply</button>
    </FlexContainer>
  </FlexContainer>

  return (
    <Node 
      id={id}
      name='WaveShaper'
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
    />
  )
}

const EquationInput = styled.input<{ error: boolean}>`
min-width: 400px;
border: 1px solid #000;
border-radius: 0;
margin-top: 5px;
outline: none;

${({ error }) => error && 'border-color: red;'}
`