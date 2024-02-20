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
import { convertFloatArrayToUint8, curve } from '../../../helpers'
import { Background, Canvas } from '.'

export function SpectrumAnalyser({ id, data, startExpanded, type, onTypeChange }: AnalyserTypeProps) {
  const [resolution, setResolution] = useState(data.resolution ?? 2)
  const resolutionRef = useRef(resolution)
  const [width, setWidth] = useState(data.width ?? 2)
  const widthRef = useRef(width)
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
    const invalid = [resolution, width].find(param => {
      if (param === undefined || Number.isNaN(param)) return true
    })

    if (invalid) return

    updateNode({ type, resolution, width })
  }, [type, resolution, width ])

  function startDrawing() {
    fpsInterval = 1000 / fps
    then = Date.now()
    
    drawAnalyser()
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
      width={width * 3}
      background={<Background ref={canvasWrapper}><Canvas ref={canvas}/></Background>}
      startExpanded={startExpanded}
    />
  )
}

