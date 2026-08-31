class LooperProcessor extends AudioWorkletProcessor {
  static MAX_SECONDS = 60

  static get parameterDescriptors() {
    return [
      { name: 'speed', defaultValue: 1, minValue: 0, maxValue: 10 },
      { name: 'scrub', defaultValue: 0, minValue: 0, maxValue: 1 },
    ]
  }

  constructor() {
    super()
    this.state = 'empty' // empty | recording | playing | overdubbing | stopped
    this.channels = []
    this.chunks = []
    this.length = 0
    this.readPos = 0
    this.currentSpeed = 1
    this.reverse = false
    this.scrubConnected = false
    this.baselineSpeed = 1
    this.baselineReverse = false
    this.undoSnapshot = null
    this.reportCounter = 0
    this.reportEvery = 1024
    this.triggerSamplesRemaining = 0
    this.triggerHoldSamples = Math.round(sampleRate * 0.1)

    this.port.onmessage = ({ data }) => {
      switch (data.cmd) {
        case 'record-start': this.startRecording(); break
        case 'record-stop': this.stopRecording(); break
        case 'overdub-start': this.startOverdub(); break
        case 'overdub-stop': this.declick(this.channels); this.state = 'playing'; break
        case 'stop': this.state = this.length > 0 ? 'stopped' : 'empty'; break
        case 'play':
          if (this.length > 0) {
            this.state = 'playing'
            this.triggerSamplesRemaining = this.triggerHoldSamples
          }
          break
        case 'undo': this.undo(); break
        case 'clear': this.clear(); break
        case 'reverse': this.reverse = data.value; break
        case 'scrub-connected': this.scrubConnected = data.value; break
      }
      this.port.postMessage({ type: 'state', value: this.state, duration: this.length / sampleRate })
    }
  }

  startRecording() {
    this.chunks = []
    this.state = 'recording'
  }

  stopRecording() {
    this.channels = this.chunks.map(parts => {
      const total = parts.reduce((sum, p) => sum + p.length, 0)
      const buf = new Float32Array(total)
      let offset = 0
      for (const p of parts) {
        buf.set(p, offset)
        offset += p.length
      }
      return buf
    })
    this.length = this.channels[0]?.length ?? 0
    this.chunks = []
    this.readPos = 0
    this.declick(this.channels)
    this.baselineSpeed = this.currentSpeed
    this.baselineReverse = this.reverse
    this.state = this.length > 0 ? 'playing' : 'empty'
    if (this.length > 0) this.triggerSamplesRemaining = this.triggerHoldSamples
  }

  declick(channels) {
    const fadeSamples = Math.min(Math.round(sampleRate * 0.005), Math.floor(this.length / 4))
    if (fadeSamples <= 0) return

    for (const buf of channels) {
      for (let i = 0; i < fadeSamples; i++) {
        const g = i / fadeSamples
        buf[i] *= g
        buf[buf.length - 1 - i] *= g
      }
    }
  }

  startOverdub() {
    if (this.length === 0) return
    this.undoSnapshot = this.channels.map(c => c.slice())
    this.state = 'overdubbing'
  }

  undo() {
    if (this.undoSnapshot) {
      this.channels = this.undoSnapshot
      this.undoSnapshot = null
    }
  }

  clear() {
    this.channels = []
    this.chunks = []
    this.length = 0
    this.readPos = 0
    this.baselineSpeed = 1
    this.baselineReverse = false
    this.undoSnapshot = null
    this.state = 'empty'
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    const blockSize = output[0]?.length ?? 128
    this.currentSpeed = parameters.speed[0]

    const triggerOut = outputs[1]
    if (triggerOut && triggerOut[0]) {
      const ch = triggerOut[0]
      for (let i = 0; i < blockSize; i++) {
        if (this.triggerSamplesRemaining > 0) {
          ch[i] = 1
          this.triggerSamplesRemaining--
        } else {
          ch[i] = 0
        }
      }
      for (let c = 1; c < triggerOut.length; c++) triggerOut[c].set(ch)
    }

    if (this.state === 'recording') {
      for (let c = 0; c < input.length; c++) {
        if (!this.chunks[c]) this.chunks[c] = []
        this.chunks[c].push(input[c].slice())
      }
      for (let c = 0; c < output.length; c++) {
        if (input[c]) output[c].set(input[c])
      }

      const recordedSeconds = (this.chunks[0]?.length ?? 0) * blockSize / sampleRate
      if (recordedSeconds >= LooperProcessor.MAX_SECONDS) {
        this.stopRecording()
        this.port.postMessage({ type: 'state', value: this.state, duration: this.length / sampleRate })
        return true
      }

      this.reportCounter += blockSize
      if (this.reportCounter >= this.reportEvery) {
        this.reportCounter = 0
        this.port.postMessage({ type: 'elapsed', value: recordedSeconds })
      }
      return true
    }

    if ((this.state === 'playing' || this.state === 'overdubbing') && this.length > 0) {
      const relativeSpeed = this.currentSpeed / Math.max(this.baselineSpeed, 0.0001)
      const relativeReverse = this.reverse !== this.baselineReverse
      const step = relativeSpeed * (relativeReverse ? -1 : 1)
      const len = this.length

      const scrubValues = this.scrubConnected ? parameters.scrub : null
      const scrubAtRate = scrubValues && scrubValues.length > 1

      const prevReadPos = this.readPos
      const positions = new Float64Array(blockSize)
      let pos = this.readPos
      for (let i = 0; i < blockSize; i++) {
        if (scrubValues) {
          const scrub = scrubAtRate ? scrubValues[i] : scrubValues[0]
          pos = ((scrub % 1) + 1) % 1 * len
        }
        positions[i] = pos
        if (!scrubValues) pos += step
      }
      this.readPos = ((pos % len) + len) % len

      if (!scrubValues && step !== 0) {
        const wrapped = step > 0 ? this.readPos < prevReadPos : this.readPos > prevReadPos
        if (wrapped) this.triggerSamplesRemaining = this.triggerHoldSamples
      }

      const loopOut = outputs[2]

      for (let c = 0; c < output.length; c++) {
        const buf = this.channels[c % this.channels.length]
        const inCh = input[c]
        const loopCh = loopOut && loopOut[c % loopOut.length]

        for (let i = 0; i < blockSize; i++) {
          const wrapped = ((positions[i] % len) + len) % len
          const idx0 = Math.floor(wrapped)
          const idx1 = (idx0 + 1) % len
          const frac = wrapped - idx0
          let sample = buf[idx0] * (1 - frac) + buf[idx1] * frac

          if (this.state === 'overdubbing' && inCh) {
            const writeIdx = Math.round(wrapped) % len
            buf[writeIdx] += inCh[i]
          }

          // main output stays dry+wet mixed; loop output carries wet-only
          output[c][i] = sample + (inCh ? inCh[i] : 0)
          if (loopCh) loopCh[i] = sample
        }
      }

      this.reportCounter += blockSize
      if (this.reportCounter >= this.reportEvery) {
        this.reportCounter = 0
        this.port.postMessage({ type: 'position', value: this.readPos / len })
      }
      return true
    }

    // empty / stopped: pass dry signal through
    for (let c = 0; c < output.length; c++) {
      if (input[c]) output[c].set(input[c])
    }
    return true
  }
}

registerProcessor('looper-processor', LooperProcessor)
