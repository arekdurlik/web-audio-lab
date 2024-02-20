import { AnalyserProps, AnalyserType } from '../types'
import { useState } from 'react'
import styled from 'styled-components'
import { VUMeter } from './VUMeter'
import { Oscilloscope } from './Oscilloscope'
import { SpectrumAnalyser } from './SpectrumAnalyser'

export function Analyser({ id, data }: AnalyserProps) {
  const [type, setType] = useState(data.type ?? 'oscilloscope')
  const [startExpanded, setStartExpanded] = useState(false)

  function handleTypeChange(type: AnalyserType) {
    setStartExpanded(true)
    setType(type)
  }

  return  type === 'oscilloscope' ? <Oscilloscope id={id} data={data} type={type} startExpanded={startExpanded} onTypeChange={handleTypeChange} />
  :       type === 'analyser' ? <SpectrumAnalyser id={id} data={data} type={type} startExpanded={startExpanded} onTypeChange={setType} />
  :       <VUMeter id={id} data={data} type={type} startExpanded={startExpanded} onTypeChange={setType} />
}

export const Canvas = styled.canvas`
width: 100%;
height: 100%;
image-rendering: pixelated;
`
export const Background = styled.div`
position: absolute;
inset: 0;
background-color: black;
`