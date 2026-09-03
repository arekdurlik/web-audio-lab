class GranularRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.maxSamples = Math.floor(20 * sampleRate)
    this.recordBuf = null
    this.writePos = 0
    this.totalWritten = 0

    this.port.onmessage = ({ data }) => {
      if (data.cmd === 'snapshot') {
        this.sendSnapshot(data.length)
      }
    }
  }

  ensureBuffers(channelCount) {
    if (!this.recordBuf || this.recordBuf.length !== channelCount) {
      this.recordBuf = Array.from({ length: channelCount }, () => new Float32Array(this.maxSamples))
      this.writePos = 0
      this.totalWritten = 0
    }
  }

  sendSnapshot(lengthSeconds) {
    if (!this.recordBuf) return

    const requested = Math.max(
      1,
      Math.min(this.maxSamples, Math.floor((lengthSeconds || this.maxSamples / sampleRate) * sampleRate))
    )
    const length = Math.max(1, Math.min(requested, this.totalWritten))
    const endPos = this.writePos
    const channels = this.recordBuf.map(channel => {
      const linear = new Float32Array(length)
      for (let i = 0; i < length; i++) {
        linear[i] = channel[(endPos - length + i + this.maxSamples) % this.maxSamples]
      }
      return linear
    })

    this.port.postMessage(
      { type: 'snapshot', channels, sampleRate },
      channels.map(c => c.buffer)
    )
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0) return true

    this.ensureBuffers(input.length)

    const blockSize = input[0].length
    for (let i = 0; i < blockSize; i++) {
      for (let ch = 0; ch < input.length; ch++) {
        this.recordBuf[ch][this.writePos] = input[ch][i]
      }
      this.writePos = (this.writePos + 1) % this.maxSamples
      if (this.totalWritten < this.maxSamples) this.totalWritten++
    }

    return true
  }
}

registerProcessor('granular-recorder-processor', GranularRecorderProcessor)
