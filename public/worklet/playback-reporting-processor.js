export class PlaybackReportingProcessor extends AudioWorkletProcessor {

  constructor(args) {
    super(args)
    this.last = Infinity

    this.port.onMessage = function({ data }) {
      if (data.stop) {
        this.last = Infinity
      }
    }
  }

  process(inputs, _outputs, _parameters) {
    if (inputs.length > 0) {
      const input = inputs[0]
      if (input.length > 0) {
        const channel = input[0]
        const current = channel[0]
        if (current < this.last) {
          this.port.postMessage(true)
        }

        this.last = current
        return true
      }
    }
    return true
  }
}

registerProcessor('playback-reporting-processor', PlaybackReportingProcessor)