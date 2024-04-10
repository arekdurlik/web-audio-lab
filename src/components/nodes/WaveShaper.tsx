import { WaveShaperParams, WaveShaperProps, WaveShaperType } from './types'
import { useEffect, useRef, useState } from 'react'
import { Hr, Parameter } from './BaseNode/styled'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import { TextInput } from '../inputs/TextInput'
import { SelectInput } from '../inputs/SelectInput'
import { PlayButton } from './styled'

// (1 + 20) * x * 50 * (Math.PI / 180) / (Math.PI + 20 / Math.cos(x * 7.5))
export function WaveShaper({ id, data }: WaveShaperProps) {
  const [params, setParams] = useState<WaveShaperParams>({
    ...{ type: 'array', array: '-1,0,1', equation: '(3 + 20) * x * 57 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x))', oversample: 'none', expanded: { o: true, t: true }},
    ...data.params
  })

  const [arrayError, setArrayError] = useState(false)
  const [equationError, setEquationError] = useState(false)
  const audioId = `${id}-audio`
  const instance = useRef(new WaveShaperNode(audio.context, { oversample: params.oversample }))
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
    updateNode({ params })
  }, [params])

  function makeDistortionCurve() {
    const nSamples = audio.context.sampleRate
    const curve = new Float32Array(nSamples)

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1

      let newEquation = params.equation.slice().replaceAll('x', String(x))

      const func = new Function('x', `return ${newEquation}`)
      const num = func()
      curve[i] = num
    }
    return curve
  }

  function handleApply() {
    params.type === 'array' ? applyArray() : applyEquation()
  }

  function applyArray() {
    const re = /^-?\d*\.?\d+(?:[ ]?,[ ]?-?\d*\.?\d+)*$/
    const correct = re.test(params.array)
    
    if (!correct) {
      setArrayError(true)
      return
    }
    
    setArrayError(false)
    const values = params.array.split(',').map(v => Number(v))
    instance.current.curve = new Float32Array(values)
  }

  function applyEquation() {
    try {
      const slice = params.equation.slice()
      
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

  const Parameters = <FlexContainer direction='column'> 
    <SelectInput
      label='Oversample:'
      value={params.oversample}
      onChange={e => setParams(state => ({ ...state, oversample: e.target.value as OverSampleType }))}
      options={[
        { value: 'none', label: 'None' },
        { value: '2x', label: '2x' },
        { value: '4x', label: '4x' },
      ]}
      expanded={params.expanded.o}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, o: v }}))}
    />
    <Hr/>
    <SelectInput
      label='Type:'
      value={params.type}
      onChange={e => setParams(state => ({ ...state, type: e.target.value as WaveShaperType }))} 
      options={[
        { value: 'array', label: 'Array' },
        { value: 'equation', label: 'Equation' },
      ]}
      expanded={params.expanded.t}
      onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, t: v }}))}
    />
    <Hr/>
    {params.type === 'array' ? <TextInput 
      label='Array:'
      value={params.array} 
      onChange={v => setParams(state => ({ ...state, array: v }))}
      error={arrayError}
      errorMessage='Comma separated list of values required.'
    /> : <TextInput
      label='Equation:'
      value={params.equation}
      onChange={v => setParams(state => ({ ...state, equation: v }))} 
      error={equationError}
      errorMessage='Invalid equation.'
      width={400}
      />}
    <FlexContainer>
      <PlayButton onClick={handleApply}>Apply</PlayButton>
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
