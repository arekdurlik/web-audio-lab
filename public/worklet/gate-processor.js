export class GateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'threshold',
        defaultValue: 0.5, 
        minValue: -1, 
        maxValue: 1
      }, 
    ]
  }

  constructor(options) {
    super(options)

    this.threshold = options.parameterData.threshold
    this.port.onmessage = ({ data }) => {
      if (data.paramChange !== undefined) {
        this.threshold = data.paramChange
        this._up = false
      }
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    // TODO: figure out why parameters.threshold[0] value is stale
    const threshold = this.threshold

    try {
      if (input.length > 0) {
        let sum = 0.0

        let length = input[0].length
        const abs = Math.abs
        for (let i = 0; i < length; i++) {
          sum += abs(input[0][i])
        }
        const avg = sum / length
        
        if (avg >= threshold && !this._up) {
          this._up = true
        } else if (avg < threshold && this._up) {
          this._up = false
        }
      } else if (input.length === 0 && this._up) {
        this._up = false
      }
      
      if (input[0] && output[0]) {
        for (let i = 0; i < input[0].length; i++) {
          for (let j = 0; j < output.length; j++) {
            output[j][i] = this._up ? 1 : 0
          }
        }
      }
      
    } catch (error) {
      this.port.postMessage(error)
      return false
    }
    
    return true
  }
}

registerProcessor('gate-processor', GateProcessor)