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