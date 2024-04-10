import { KnobParams, KnobProps } from './types'
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { NumberInput } from '../inputs/NumberInput'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import styled from 'styled-components'
import SVG from 'react-inlinesvg'
import knobBg from '/svg/knob_bg.svg'
import { useFlowStore } from '../../stores/flowStore'
import { clamp, countDecimals, invlerp, range } from '../../helpers'
import { bline } from '../FlowEditor/EdgeController/bezier'
import { TextInput } from '../inputs/TextInput'
import { RangeInput } from '../inputs/RangeInput'
import { Hr } from './BaseNode/styled'

const DRAG_RANGE = 100

export function Knob({ id, data }: KnobProps) {
  const [params, setParams] = useState<KnobParams>({
    ...{ value: 0, min: 0, max: 1, step: 0.01, stepMin: 0, stepMax: 1, ramp: 0.03, rampMin: 0, rampMax: 2, label: '', expanded: { s: true, r: false }},
    ...data.params 
  })
  const valueRef = useRef(params.value)
  const [labelOffset, setLabelOffset] = useState(0)
  const signalId = `${id}-signal`
  const instance = useRef(new ConstantSourceNode(audio.context, { offset: params.value}))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapper = useRef<HTMLDivElement | null>(null)
  const [c, setC] = useState<CanvasRenderingContext2D  | null>(null)
  const imgData = useRef(new Uint8ClampedArray())
  const { editMode } = useFlowStore()
  const rotation = useRef((invlerp(params.min, params.max, params.value) * 2) - 1)
  const startY = useRef(0)
  const labelRef = useRef<HTMLSpanElement | null>(null)
  const DRAG_STEP = DRAG_RANGE * (invlerp(0, Math.abs(params.max - params.min), params.step))
  const lastDragRangeStep = useRef(0)

  const sockets: Socket[] = [
    {
      id: signalId,
      type: 'source',
      edge: 'right',
      offset: 16
    },
  ]

  useEffect(() => {

    updateNode({ params })
  }, [params])

  useEffect(() => {
    instance.current = new ConstantSourceNode(audio.context, { offset: params.value })
    setInstance(signalId, instance.current, 'source')
    
    try { instance.current.start() } catch {}
    return () => { try { instance.current.stop() } catch {} }
  }, [])

  useEffect(() => {
    if (params.value === undefined || Number.isNaN(params.value)) return

    instance.current.offset.cancelScheduledValues(audio.context.currentTime)
    instance.current.offset.setValueAtTime(instance.current.offset.value, audio.context.currentTime)
    instance.current.offset.linearRampToValueAtTime(params.value, audio.context.currentTime + params.ramp)
  }, [params.value])

  // setup canvas
  useEffect(() => {
    if (!canvas.current || !canvasWrapper.current) return

    canvas.current.width = canvasWrapper.current.offsetWidth
    canvas.current.height = canvasWrapper.current.offsetHeight
    setC(canvas.current.getContext('2d', { willReadFrequently: true }))
  }, [canvas, canvasWrapper])

  useEffect(() => {
    drawLine()
  }, [canvas, c])

  // keep label center
  useEffect(() => {
    if (!labelRef.current) return

    const { width } = labelRef.current.getBoundingClientRect()
    setLabelOffset(Math.round(16 - width/2) + 1)
  }, [params.label])
  
  function drawLine() {
    if (!canvas.current || !c) return

    const imageData = c.getImageData(0, 0, canvas.current.width, canvas.current.height)
    imgData.current = imageData.data

    const deg = (rotation.current * 135) - 90
    const r = 16
    const [x, y] = [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)]
    bline(Math.round(r), Math.round(r), Math.round(16 +x), Math.round(16+ y), setPixel)
    c.putImageData(imageData, 0, 0)
  }

  function handleDragStart(event: ReactPointerEvent) {
    if (editMode || !canvas.current) return
    document.removeEventListener('pointerup', handleDragEnd)
    
    const rect = canvas.current.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    const xc = rect.left + rect.width / 2
    const yc = rect.top + rect.height / 2
    const inCircle = pointInCircle(x, y, xc, yc, 16)

    if (!inCircle) return

    startY.current = y
    lastDragRangeStep.current = 0
    
    document.addEventListener('pointermove', handleDrag)
    document.addEventListener('pointerup', handleDragEnd)
  }

  function setPixel(x: number, y: number) {
    if (canvas.current === null) return
    var n = (y * canvas.current.width + x) * 4
    imgData.current[n] = 255
    imgData.current[n + 1] = 255
    imgData.current[n + 2] = 255
    imgData.current[n + 3] = 255
  }

  function handleDrag(event: PointerEvent) {
    if (!canvas.current || !c) return

    const coalescedEvents = event.getCoalescedEvents()
    
    for (let coalesced of coalescedEvents) {
      const dragOffset = startY.current - (coalesced.clientY)
      const dragRangeStep = Math.round(dragOffset / DRAG_STEP)

      const direction = dragRangeStep - lastDragRangeStep.current

      lastDragRangeStep.current = dragRangeStep
      
      let newValue = valueRef.current
      if (direction > 0) {
        newValue = clamp(valueRef.current + params.step, params.min, params.max)
      } else if (direction < 0) {
        newValue = clamp(valueRef.current - params.step, params.min, params.max)
      }
      
      const decimals = countDecimals(params.step.toString())
      const rounded = Number(newValue.toFixed(decimals))

      setParams(state => ({ ...state, value: rounded }))
      valueRef.current = rounded
      rotation.current = range(rounded, params.min, params.max, -1, 1)

      c.clearRect(0, 0, canvas.current.width, canvas.current.height)
      drawLine()
    }
  }

  function handleDragEnd() {
    document.removeEventListener('pointermove', handleDrag)
    document.removeEventListener('pointerup', handleDragEnd)
  }

  function pointInCircle(x: number, y: number, cx: number, cy: number, radius: number) {
    const distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy)
    return distancesquared <= radius * radius
  }

  const Parameters = <FlexContainer direction='column'>
      <ValueWrapper direction='column' gap={4}>
        Value: {params.value}
        
        <FlexContainer gap={8} justify='flex-end'>
          <NumberInput
            label='min:'
            width={50}
            onChange={v => setParams(state => ({ ...state, min: v }))} 
            value={params.min}
            />
          <NumberInput
            label='max:'
            width={50}
            onChange={v => setParams(state => ({ ...state, max: v }))} 
            value={params.max}
            />
        </FlexContainer>
      </ValueWrapper>
      <Hr/>
      <RangeInput
        label='Step:'
        value={params.step}
        min={params.stepMin}
        max={params.stepMax}
        step={0.0001}
        onChange={v => setParams(state => ({ ...state, step: v }))}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, stepMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, stepMax: v }))}
        expanded={params.expanded.s}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, s: v }}))}
      />
      <Hr/>
      <RangeInput
        label='Ramp:'
        value={params.ramp}
        min={params.rampMin}
        max={params.rampMax}
        onChange={v => setParams(state => ({ ...state, ramp: v }))}
        numberInput
        numberInputWidth={50}
        adjustableBounds
        onMinChange={v => setParams(state => ({ ...state, rampMin: v }))}
        onMaxChange={v => setParams(state => ({ ...state, rampMax: v }))}
        expanded={params.expanded.r}
        onExpandChange={v => setParams(state => ({ ...state, expanded: { ...state.expanded, r: v }}))}
      />
      <Hr/>
      <TextInput
        label='Label:'
        value={params.label}
        onChange={v => setParams(state => ({ ...state, label: v }))} 
      />
  </FlexContainer>

  return (
    <Node 
      id={id}
      data={data}
      sockets={sockets}
      width={2}
      height={2}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameterOffset={16}
      parameters={Parameters}
      disableBackground
      disableBorder
      background={
      <Background 
       ref={canvasWrapper}
        onPointerDown={handleDragStart} 
        className={`${!editMode && 'nopan'}`} 
      > 
        <Label ref={labelRef} left={labelOffset}>{params.label}</Label>
        <Canvas ref={canvas} />
        <KnobSvg src={knobBg}/>
        </Background>
      }
      optionsStyle={{
        left: '-15px',
        top: '1px',
        width: '63px'
      }}
    />
  )
}

const Label = styled.span<{ left?: number }>`
position: absolute;
top: -16px;
${({ left }) => left && `left: ${left}px`}
`
export const Background = styled.div`
position: absolute;
inset: 0;
z-index: 2;
`
export const Canvas = styled.canvas`
position: absolute;
width: 100%;
height: 100%;
image-rendering: pixelated;
z-index: 9999;
`
const KnobSvg = styled(SVG)`
position: absolute;
left: 0;
top: 0;
`

const ValueWrapper = styled(FlexContainer)`
margin: 4px 5px;
`