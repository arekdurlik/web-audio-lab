import { AnalyserProps, AnalyserType } from './types'
import { useEffect, useRef, useState } from 'react'
import { Node } from './BaseNode'
import { Socket } from './BaseNode/types'
import { useNodeStore } from '../../stores/nodeStore'
import { audio } from '../../main'
import { FlexContainer } from '../../styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import styled from 'styled-components'
import { Parameter } from './BaseNode/styled'
import { RangeInput } from '../inputs/RangeInput'
import { NumberInput } from '../inputs/NumberInput'
import { Select } from '../inputs/styled'
import { convertFloatArrayToUint8, curve, invlerp } from '../../helpers'

export function Analyser({ id, data }: AnalyserProps) {
  const [type, setType] = useState(data.type ?? 'vu-meter')
  const [width, setWidth] = useState(data.width ?? 4)
  const widthRef = useRef(width)
  const [resolution, setResolution] = useState(data.resolution ?? 2)
  const resolutionRef = useRef(resolution)
  const [fitInScreen, setFitInScreen] = useState(data.fitInScreen ?? false)
  const fitInScreenRef = useRef(fitInScreen)
  const [scale, setScale] = useState(data.scale ?? 1)
  const scaleRef = useRef(scale)
  const audioId = `${id}-audio`
  const [instance] = useState(new AnalyserNode(audio.context, { smoothingTimeConstant: 0, fftSize: 2048 }))
  const [dataArray] = useState(new Float32Array(instance.frequencyBinCount))
  const setInstance = useNodeStore(state => state.setInstance)
  const { updateNode } = useUpdateFlowNode(id)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapper = useRef<HTMLDivElement | null>(null)
  const [c, setC] = useState<CanvasRenderingContext2D  | null>(null)
  const rafID = useRef(0)
  const [x,setX] = useState(30)
  const [y,setY] = useState(150)
  const xRef = useRef(x)
  const yRef = useRef(y)
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
  }, [canvas, c, canvasWrapper, width, type])

  useEffect(() => {
    instance.connect(audio.context.destination)
    setInstance(audioId, instance, 'source')

    return(() => { try { 
      instance.disconnect(audio.context.destination) 
      cancelAnimationFrame(rafID.current)
    } catch {}})
  }, [])

  useEffect(() => {
    const invalid = [type, width, scale].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    updateNode({ type, width, scale, fitInScreen })
  }, [type, width, scale, fitInScreen])

  function startDrawing() {
    fpsInterval = 1000 / fps
    then = Date.now()
    
    switch(type) {
      case 'oscilloscope':
        drawOscilloscope()
        break
      case 'analyser':
        drawAnalyser()
        break
      case 'vu-meter':
        drawVuMeter()
    }
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

  function drawAnalyser() {
    if (!canvas.current || !c) return
    rafID.current = requestAnimationFrame(drawAnalyser)
    
    if (!checkFramePassed()) return

    instance.getFloatFrequencyData(dataArray)
    let dbArray = convertFloatArrayToUint8(dataArray, [instance.minDecibels, instance.maxDecibels])

    const bars = 5 * (resolutionRef.current) * widthRef.current
    const gap = 1

    const cwidth = canvas.current.width
    const cheight = canvas.current.height
    const meterWidth = (cwidth / bars) - 0.9

    const gradient = c.createLinearGradient(0, 0, 0, 100)
    gradient.addColorStop(1, `rgb(0, 255, 0)`)
    gradient.addColorStop(0.15, `rgb(0, 255, 0)`)
    gradient.addColorStop(0.14, `rgb(255, 0, 0)`)
    gradient.addColorStop(0, `rgb(255, 0, 0)`)

    c.fillStyle = '#000000'
    c.fillRect(0, 0, cwidth, cheight)

    // get samples logarithmically
    const length = dbArray.length
    const values = []

    for (let i = 0; i < length; i++) {
      values.push(Math.floor(curve(i, 0 , length, 30)))
    }

    const unique = [...new Set(values)]

    // draw bars
    for (let i = 0; i < bars; i++) {
      const value = dbArray[unique[Math.floor(i*(length/(7.5*bars)))]]
      
      c.fillStyle = gradient
      c.fillRect(i * meterWidth + (i*gap), cheight, meterWidth, cheight - value + 20)
    }
  }

  function drawVuMeter() {
    if (!canvas.current || !c) return
    rafID.current = requestAnimationFrame(drawVuMeter)
    
    if (!checkFramePassed()) return

    instance.getFloatTimeDomainData(dataArray)
    
    let sumOfSquares = 0
    for (let i = 0; i < dataArray.length; i++) {
      sumOfSquares += dataArray[i] ** 2
    }
    const avgPowerDecibels = 10 * Math.log10(sumOfSquares / dataArray.length)
    const cwidth = canvas.current.width
    const cheight = canvas.current.height

    c.fillStyle = '#000000'
    c.fillRect(0, 0, cwidth, cheight)

    c.font = '24px PixelMono'
    c.fillStyle = '#aaa'
    const h = cheight - 3
    switch (widthRef.current) {
      case 1:
        c.fillText('-30', cwidth * 0.001, h)
        c.fillText('0', cwidth * 0.82, h)

        c.fillStyle = '#777'
        c.fillRect(cwidth * 0.82 + 3.5, 0, 3, cheight - 20)
        break
      case 2:
        c.fillText('-30', cwidth * 0.001, h)
        c.fillText('-15', cwidth * 0.30, h)
        c.fillText('-7', cwidth * 0.6, h)
        c.fillText('0', cwidth * 0.85, h)

        c.fillStyle = '#777'
        c.fillRect(cwidth * 0.85 + 3.5, 0, 3, cheight - 20)
        break
      case 3:
        c.fillText('-30', cwidth * 0.001, h)
        c.fillText('-20', cwidth * 0.225, h)
        c.fillText('-10', cwidth * 0.53, h)
        c.fillText('-5', cwidth * 0.69, h)
        c.fillText('0', cwidth * 0.865, h)
        c.fillText('dB', cwidth * 0.92, h)
        
        c.fillStyle = '#777'
        c.fillRect(cwidth * 0.865 + 3.5, 0, 3, cheight - 20)
        break
      case 4:
        c.fillText('-30', cwidth * 0.001, h)
        c.fillText('-20', cwidth * 0.245, h)
        c.fillText('-10', cwidth * 0.545,h)
        c.fillText('-5', cwidth * 0.7, h)
        c.fillText('0', cwidth * 0.87, h)
        c.fillText('dB', cwidth * 0.94, h)

        c.fillStyle = '#777'
        c.fillRect(cwidth * 0.87 + 3.5, 0, 3, cheight - 20)
        break
    }

    const gradient = c.createLinearGradient(cwidth, 0, 0, 0)
    gradient.addColorStop(1, `rgb(0, 255, 0)`)
    gradient.addColorStop(0.119, `rgb(0, 255, 0)`)
    gradient.addColorStop(0.118, `rgb(255, 0, 0)`)
    gradient.addColorStop(0, `rgb(255, 0, 0)`)
    c.fillStyle = gradient
    c.fillRect(0, 0, cwidth * invlerp(-30, 4, avgPowerDecibels), cheight - 20)
  }

  const Parameters = <FlexContainer direction='column' gap={8}>
    <div>
      Type:
      <Parameter>
      <Select 
        value={type}
        onChange={e => setType(e.target.value as AnalyserType)} 
      >
        <option value='oscilloscope'>Oscilloscope</option>
        <option value='analyser'>Spectrum analyser</option>
        <option value='vu-meter'>VU Meter</option>
      </Select>
      </Parameter>
    </div>
    {type === 'oscilloscope' && <div>
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
    </div>}
    {type === 'analyser' && <div>
      Resolution:
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
            value={resolution}
            onChange={v => { setResolution(v); resolutionRef.current = v }} 
            />
          <NumberInput 
            min={1}
            max={4}
            step={1}
            value={resolution}
            onChange={v => { setResolution(v); resolutionRef.current = v }} 
            />
        </Parameter>
      </FlexContainer>
    </div>}
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
    {type === 'oscilloscope' && <div>
      Fit in screen:
      <input type='checkbox' checked={fitInScreen} onChange={() => { setFitInScreen(!fitInScreen); fitInScreenRef.current = !fitInScreen }}/>
    </div>}
    {/* <div>
      x:
      <FlexContainer
        direction='column'
        gap={8}
      >
        <Parameter>
          <RangeInput
            min={0}
            max={512}
            step={1}
            defaultValue={1}
            value={x}
            onChange={v => { setX(v); xRef.current = v }} 
            />
          <NumberInput 
            min={0}
            max={512}
            step={1}
            value={x}
            onChange={v => { setX(v); xRef.current = v }} 
            />
        </Parameter>
      </FlexContainer>
    </div>
    <div>
      y:
      <FlexContainer
        direction='column'
        gap={8}
      >
        <Parameter>
          <RangeInput
            min={0}
            max={2200}
            step={0.01}
            defaultValue={1}
            value={y}
            onChange={v => { setY(v); yRef.current = v }} 
            />
          <NumberInput 
            min={0}
            max={2200}
            step={0.01}
            value={y}
            onChange={v => { setY(v); yRef.current = v }} 
            />
        </Parameter>
      </FlexContainer>
    </div> */}
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
      valueColor={type === 'oscilloscope' ? '#00ffff' : '#ff0000'}
      value={type === 'oscilloscope' ? scale : undefined}
      valueUnit={type === 'oscilloscope' ? 'x' : undefined}
      width={width * 3}
      background={<Background ref={canvasWrapper}><Canvas ref={canvas}/></Background>}
    />
  )
}

const Canvas = styled.canvas`
width: 100%;
height: 100%;
image-rendering: pixelated;
`
const Background = styled.div`
position: absolute;
inset: 0;
background-color: black;
`