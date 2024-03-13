import { WaveShaperProps, WaveShaperType } from './types'
import { useEffect, useRef, useState } from 'react'
import { Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { TextInput } from '../inputs/TextInput'
import { SelectInput } from '../inputs/SelectInput'

// (1 + 20) * x * 50 * (Math.PI / 180) / (Math.PI + 20 / Math.cos(x * 7.5))
export function WaveShaper({ id, data }: WaveShaperProps) {
  const [type, setType] = useState(data.type ?? 'array')
  const [array, setArray] = useState(data.array ?? '-1,0,1')
  const [equation, setEquation] = useState(data.equation ?? '(3 + 20) * x * 57 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x))')
  const [oversample, setOversample] = useState(data.oversample ?? 'none')
  const [arrayError, setArrayError] = useState(false)
  const [equationError, setEquationError] = useState(false)

  const audioId = `${id}-audio`
  const instance = useRef(new WaveShaperNode(audio.context, { oversample: data.oversample }))
  const setInstance = useNodeStore(state => state.setInstance)
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

  // update reactflow data
  useEffect(() => {
    updateNode({ type, array, oversample, equation })
  }, [type, array, equation, oversample])

  function makeDistortionCurve() {
    const nSamples = audio.context.sampleRate
    const curve = new Float32Array(nSamples)

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1

      let newEquation = equation.slice().replaceAll('x', String(x))

      const func = new Function('x', `return ${newEquation}`)
      const num = func()
      curve[i] = num
    }
    return curve
  }

  function handleApply() {
    type === 'array' ? applyArray() : applyEquation()
  }

  function applyArray() {
    const re = /^-?\d*\.?\d+(?:[ ]?,[ ]?-?\d*\.?\d+)*$/
    const correct = re.test(array)
    
    if (!correct) {
      setArrayError(true)
      return
    }
    
    setArrayError(false)
    const values = array.split(',').map(v => Number(v))
    instance.current.curve = new Float32Array(values)
  }

  function applyEquation() {
    try {
      const slice = equation.slice()
      
      const func = new Function('x', `return ${slice}`)
      const num = func()

      // throw if equation doesn't return number
      num.toFixed(1)

      setEquationError(false)
      instance.current.curve = makeDistortionCurve()
    } catch (e) {
      console.error(e)
      setEquationError(true)
    }
  }

  const Parameters = <FlexContainer 
    direction='column' 
    gap={8}
  > 
    <SelectInput
      label='Oversample:'
      value={oversample}
      onChange={e => setOversample(e.target.value as OverSampleType)}
    >
      <option value='none'>None</option>
      <option value='2x'>2x</option>
      <option value='4x'>4x</option>
    </SelectInput>
    <SelectInput
      label='Type:'
      value={type}
      onChange={e => setType(e.target.value as WaveShaperType)} 
    >
      <option value='array'>Array</option>
      <option value='equation'>Equation</option>
    </SelectInput>
    <div>
      {type === 'array' ? <>
        Array:
        <FlexContainer
          direction='column'
          gap={8}
        >
          <Parameter>
            <TextInput 
              value={array} 
              onChange={setArray}
              error={arrayError}
              errorMessage='Comma separated list of values required.'
            />
          </Parameter>
        </FlexContainer>
      </> : <>
        Equation:
        <FlexContainer
          direction='column'
          gap={8}
        >
          <Parameter>
            <TextInput
              value={equation}
              onChange={setEquation} 
              error={equationError}
              errorMessage='Invalid equation.'
              width={400}
              />
          </Parameter>
        </FlexContainer>
      </>}
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
