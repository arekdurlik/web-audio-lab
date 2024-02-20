export type NodeProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
  }
}

export type GainProps = NodeProps & {
  data: {
    gain?: number
    min?: number
    max?: number
  }
}

export type AnalyserType = 'oscilloscope' | 'analyser' | 'vu-meter'
export type AnalyserProps = NodeProps & {
  data: {
    type?: AnalyserType
    width?: number
    scale?: number
    fitInScreen?: boolean
    resolution?: number
  }
}

export type AnalyserTypeProps = AnalyserProps & {
  type: AnalyserType,
  startExpanded?: boolean,
  onTypeChange: (type: AnalyserType) => void
}

export type StereoPannerProps = NodeProps & {
  data: {
    pan?: number
  }
}

export type DelayProps = NodeProps & {
  data: {
    time?: number
  }
}

export type BiquadFilterParam = 'frequency' | 'detune' | 'Q' | 'gain'
export type BiquadFilterProps = NodeProps & {
  data: {
    frequency?: number
    detune?: number
    Q?: number
    gain?: number
    type?: BiquadFilterType
  }
}

export type OscillatorProps = NodeProps & {
  data: {
    playing?: boolean,
    frequency?: number,
    detune?: number,
    type?: OscillatorType
    real?: number[]
    imag?: number[]
  }
}

export type ConstantSourceProps = NodeProps & {
  data: {
    playing?: boolean,
    offset?: number
    min?: number
    max?: number
  }
}

export type AudioBufferSourceFile = 'white-noise' | 'pink-noise' | 'brownian-noise'
export type AudioBufferSourceProps = NodeProps & {
  id: string
  data: {
    source?: AudioBufferSourceFile
    playing?: boolean
    loop?: boolean
    playbackRate?: number
  }
}

export type ConvolverType = 'file' | 'generate'
export type ConvolverProps = NodeProps & {
  data: {
    type?: ConvolverType
    source?: string
    fadeInTime?: number
    decayTime?: number
    lpFreqStart?: number
    lpFreqEnd?: number,
    reverse?: boolean
  }
}

export type BitcrusherProps = NodeProps & {
  data: {
    bitDepth?: number
    sampleRateReduction?: number
  }
}

export type WaveShaperProps = NodeProps & {
  data: {
    variable?: boolean
    equation?: string
    amount?: number
    oversample?: OverSampleType
  }
}

export type NoteProps = NodeProps & {
  data: {
    content?: string
    size?: {
      height: number
      width: number
    }
  }
}

export type TextProps = NodeProps & {
  data: {
    content?: string
  }
}