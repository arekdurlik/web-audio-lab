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
export type AudioBufferSourceProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
    source?: AudioBufferSourceFile
    playing?: boolean
    loop?: boolean
  }
}

export type ConvolverType = 'file' | 'generate'
export type ConvolverProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
    type?: ConvolverType
    source?: string
    fadeInTime?: number
    decayTime?: number
    lpFreqStart?: number
    lpFreqEnd?: number,
    reverse?: boolean
  }
}

export type BitcrusherProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
    bitDepth?: number
    sampleRateReduction?: number
  }
}