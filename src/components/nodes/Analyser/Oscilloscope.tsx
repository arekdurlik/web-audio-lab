import { AnalyserType, AnalyserTypeProps } from '../types'
import { useEffect, useRef, useState } from 'react'
import { Node } from '../BaseNode'
import { Socket } from '../BaseNode/types'
import { useNodeStore } from '../../../stores/nodeStore'
import { audio } from '../../../main'
import { FlexContainer } from '../../../styled'
import { useUpdateFlowNode } from '../../../hooks/useUpdateFlowNode'
import { Parameter } from '../BaseNode/styled'
import { RangeInput } from '../../inputs/RangeInput'
import { NumberInput } from '../../inputs/NumberInput'
import { Select } from '../../inputs/styled'
import { convertFloatArrayToUint8 } from '../../../helpers'
import { Background, Canvas } from '.'

export function Oscilloscope({ id, data, startExpanded, type, onTypeChange }: AnalyserTypeProps) {
  const [scale, setScale] = useState(data.scale ?? 1)
  const scaleRef = useRef(scale)
  const [width, setWidth] = useState(data.width ?? 2)
  const widthRef = useRef(width)
  const [fitInScreen, setFitInScreen] = useState(data.fitInScreen ?? false)
  const fitInScreenRef = useRef(fitInScreen)
  const audioId = `${id}-audio`
  const [instance] = useState(new AnalyserNode(audio.context, { smoothingTimeConstant: 0, fftSize: 2048 }))
  const [dataArray] = useState(new Float32Array(instance.frequencyBinCount))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapper = useRef<HTMLDivElement | null>(null)
  const [c, setC] = useState<CanvasRenderingContext2D  | null>(null)
  const rafID = useRef(0)
  let fps = 75, fpsInterval: number, now, then: number, elapsed

  const sockets: Socket[] = [
    {
      id: audioId,
      label: '',
      type: 'target',
      edge: 'left',
      offset: [24, 24 * width, 24, 24 * width]
    },
    {
      id: audioId,
      label: '',
      type: 'source',
      edge: 'right',
      offset: [24, 24 * width, 24, 24 * width]
    }
  ]

  // get canvas context
  useEffect(() => {
    if (!canvas.current) return

    setC(canvas.current.getContext('2d'))
  }, [canvas])

  // setup canvas
  useEffect(() => {
    if (!canvas.current || !c || !canvasWrapper.current) return
    cancelAnimationFrame(rafID.current)

    canvas.current.width = canvasWrapper.current.offsetWidth * 2
    canvas.current.height = canvasWrapper.current.offsetHeight * 2
    c.fillStyle ='#000000'
    c.fillRect(0, 0, canvas.current.width, canvas.current.height)
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(0, canvas.current.height / 2)
    c.lineTo(canvas.current.width, canvas.current.height / 2)
    c.stroke()

    startDrawing()
  }, [canvas, c, canvasWrapper, width])

  useEffect(() => {
    instance.connect(audio.context.destination)
    setInstance(audioId, instance, 'source')

    return(() => { try { 
      instance.disconnect(audio.context.destination) 
      cancelAnimationFrame(rafID.current)
    } catch {}})
  }, [])

  useEffect(() => {
    const invalid = [scale, width].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    updateNode({ type, scale, width, fitInScreen })
  }, [type, scale, width, fitInScreen])

  function startDrawing() {
    fpsInterval = 1000 / fps
    then = Date.now()

    drawOscilloscope()

  }

  // check fps
  function checkFramePassed() {
    now = Date.now()
    elapsed = now - then
    if (elapsed < fpsInterval) {
      return false
    } else {
      then = now
      return true
    }
  }

  function drawOscilloscope() {
    if (!canvas.current || !c) return
    rafID.current = requestAnimationFrame(drawOscilloscope)

    if (!checkFramePassed()) return

    instance.getFloatTimeDomainData(dataArray)
    const dbArray = convertFloatArrayToUint8(dataArray, [-1,1])

    const segmentWidth = canvas.current.width / instance.frequencyBinCount * (fitInScreenRef.current ? widthRef.current : 4)
    c.fillRect(0, 0, canvas.current.width, canvas.current.height)

    c.strokeStyle = '#003300'
    for (let i = 1; i <= widthRef.current * 4; i++) {
      c.beginPath()
      c.moveTo(24 * i, 0)
      c.lineTo(24 * i, 200)
      c.stroke()
    }

    c.beginPath()
    c.moveTo(0, (canvas.current.height * 1/4))
    c.lineTo(canvas.current.width, (canvas.current.height * 1/4))
    c.stroke()

    c.beginPath()
    c.moveTo(0, (canvas.current.height * 2/4))
    c.lineTo(canvas.current.width, (canvas.current.height * 2/4))
    c.stroke()

    c.beginPath()
    c.moveTo(0, (canvas.current.height * 3/4))
    c.lineTo(canvas.current.width, (canvas.current.height * 3/4))
    c.stroke()

    c.strokeStyle = '#0f0'
    c.beginPath()
    c.moveTo(-100, canvas.current.height / 2)

    for (let i = 1; i < instance.frequencyBinCount; i += 1) {
      let x = i * segmentWidth / widthRef.current
      let v = ((dbArray[i]) / (128 / scaleRef.current)) - (scaleRef.current - 1)
      let y = (v * canvas.current.height) / 2
      c.lineTo(x, y)
    }

    c.lineTo(canvas.current.width + 100, canvas.current.height / 2)
    c.stroke()
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <div>
      Type:
      <Parameter>
      <Select 
        value={type}
        onChange={e => onTypeChange(e.target.value as AnalyserType)} 
      >
        <option value='oscilloscope'>Oscilloscope</option>
        <option value='analyser'>Spectrum analyser</option>
        <option value='vu-meter'>VU Meter</option>
      </Select>
      </Parameter>
    </div>
    <div>
      Scale:
      <FlexContainer
        direction='column'
        gap={8}
      >
        <Parameter>
          <RangeInput
            min={0}
            max={10}
            step={0.01}
            defaultValue={1}
            value={scale}
            onChange={v => { setScale(v); scaleRef.current = v }} 
            />
          <NumberInput 
            min={0}
            max={10}
            step={0.01}
            value={scale}
            onChange={v => { setScale(v); scaleRef.current = v }} 
            />
        </Parameter>
      </FlexContainer>
    </div>
    <div>
      Width:
      <FlexContainer
        direction='column'
        gap={8}
      >
        <Parameter>
          <RangeInput
            min={1}
            max={4}
            step={1}
            defaultValue={1}
            value={width}
            onChange={v => { setWidth(v); widthRef.current = v }} 
            />
          <NumberInput 
            min={1}
            max={4}
            step={1}
            value={width}
            onChange={v => { setWidth(v); widthRef.current = v }} 
            />
        </Parameter>
      </FlexContainer>
    </div>
    <div>
      Fit in screen:
      <input type='checkbox' checked={fitInScreen} onChange={() => { setFitInScreen(!fitInScreen); fitInScreenRef.current = !fitInScreen }}/>
    </div>
  </FlexContainer>

  return (
    <Node 
      id={id}
      data={data}
      sockets={sockets}
      parameterPositions={['bottom', 'left', 'top', 'right']}
      parameters={Parameters}
      optionsColor='white'
      constantSize
      valueFont='PixelMono'
      valueColor='#00ffff'
      value={scale}
      valueUnit='x'
      width={width * 3}
      background={<Background ref={canvasWrapper}><Canvas ref={canvas}/></Background>}
      startExpanded={startExpanded}
    />
  )
}
