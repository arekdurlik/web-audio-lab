class BitCrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'bitDepth',
        defaultValue: 12, 
        minValue: 2, 
        maxValue: 24
      }, 
      {
        name: 'frequencyReduction',
        defaultValue: 1,
        minValue: 1,
        maxValue: 1000,
      },
    ];
  }

  constructor() {
    super()
    this.lastSampleValue = 0
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]

    const bitDepth = parameters.bitDepth
    const frequencyReduction = parameters.frequencyReduction
    const isBitDepthConstant = bitDepth.length === 1

    try {
      if (input.length > 0 && output.length > 0) {
        for (let channel = 0; channel < input.length; ++channel) {
          const inputChannel = input[channel]
          const outputChannel = output[channel]
    
          let step = Math.pow(0.5, bitDepth[0])
    
          for (let i = 0; i < inputChannel.length; ++i) {
            if (!isBitDepthConstant) {
              step = Math.pow(0.5, bitDepth[i])
            }
    
            if (i % frequencyReduction === 0) {
              this.lastSampleValue = step * Math.floor(inputChannel[i] / step + 0.5)
            }
            outputChannel[i] = this.lastSampleValue
          }
        }
        return true
      } else {
        return false
      }
    } catch (error) {
      this.port.postMessage(error)
      return false
    }
  }
}

registerProcessor('bit-crusher-processor', BitCrusherProcessor)