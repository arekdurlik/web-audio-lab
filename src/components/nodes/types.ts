export type NodeProps = {
  id: string
  data: {
    rotation?: 0 | 1 | 2 | 3
    params: {
      expanded: {
        [x:string] : boolean
      }
    }
  }
}

export type GainParams = GainProps['data']['params']
export type GainProps = NodeProps & {
  data: {
    params: {
      gain: number
      min: number
      max: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}

export type EnvelopeParams = EnvelopeProps['data']['params']
export type EnvelopeProps = NodeProps & {
  data: {
    params: {
      a: number
      aMin: number
      aMax: number
      d: number
      dMin: number
      dMax: number
      s: number
      sMin: number
      sMax: number
      r: number
      rMin: number
      rMax: number
    }
  }
}

export type AnalyserType = 'oscilloscope' | 'analyser' | 'vu-meter'
export type AnalyserParams = AnalyserProps['data']['params']
export type AnalyserProps = NodeProps & {
  data: {
    params: {
      type: AnalyserType
      width: number
      scale: number
      fitInScreen: boolean
      resolution: number
    }
  }
}

export type StereoPannerParams = StereoPannerProps['data']['params']
export type StereoPannerProps = NodeProps & {
  data: {
    params: {
      pan: number
      min: number
      max: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}
export type DelayParams = DelayProps['data']['params']
export type DelayProps = NodeProps & {
  data: {
    params: {
      time: number
      min: number
      max: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}

export type BiquadFilterParam = 'frequency' | 'detune' | 'Q' | 'gain'
export type BiquadFilterParams = BiquadFilterProps['data']['params']
export type BiquadFilterProps = NodeProps & {
  data: {
    params: {
      type: BiquadFilterType
      frequency: number
      detune: number
      Q: number
      gain: number
    }
  }
}

export type OscillatorParams = OscillatorProps['data']['params']
export type OscillatorProps = NodeProps & {
  data: {
    params: {
      playing: boolean
      frequency: number
      detune: number
      type: OscillatorType
      customLength: number
      real: number[]
      imag: number[]
    }
  }
}

export type ConstantSourceParams = ConstantSourceProps['data']['params']
export type ConstantSourceProps = NodeProps & {
  data: {
    params: {
      playing: boolean,
      offset: number
      min: number
      max: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}

export type AudioBufferSourceParams = AudioBufferSourceProps['data']['params']
export type AudioBufferSourceProps = NodeProps & {
  data: {
    params: {
      source: string
      playing: boolean
      loop: boolean
      playbackRate: number
    }
  }
}

export type ConvolverType = 'file' | 'generate'
export type ConvolverParams = ConvolverProps['data']['params']
export type ConvolverProps = NodeProps & {
  data: {
    params: {
      type: ConvolverType
      source: string
      fadeInTime: number
      decayTime: number
      lpFreqStart: number
      lpFreqEnd: number,
      reverse: boolean
    }
  }
}

export type BitcrusherParams = BitcrusherProps['data']['params']
export type BitcrusherProps = NodeProps & {
  data: {
    params: {
      bitDepth: number
      sampleRateReduction: number
    }
  }
}

export type PitchshifterParams = PitchshifterProps['data']['params']
export type PitchshifterProps = NodeProps & {
  data: {
    params: {
      pitchOffset: number
    }
  }
}

export type GateParams = GateProps['data']['params']
export type GateProps = NodeProps & {
  data: {
    params: {
      threshold: number
      min: number
      max: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}

export type WaveShaperType = 'array' | 'equation'
export type WaveShaperParams = WaveShaperProps['data']['params']
export type WaveShaperProps = NodeProps & {
  data: {
    params: {
      type: WaveShaperType
      array: string
      equation: string
      oversample: OverSampleType
    }
  }
}
export type NoteParams = NoteProps['data']['params']
export type NoteProps = NodeProps & {
  data: {
    params: {
      content: string
      size: {
        height: number
        width: number
      }
    }
  }
}

export type TextParams = NoteProps['data']['params']
export type TextProps = NodeProps & {
  data: {
    params: {
      content: string
      size: {
        height: number
        width: number
      }
    }
  }
}

export type KnobParams = KnobProps['data']['params']
export type KnobProps = NodeProps & {
  data: {
    params: {
      value: number
      min: number
      max: number
      label: string
      step: number
      stepMin: number
      stepMax: number
      ramp: number
      rampMin: number
      rampMax: number
    }
  }
}