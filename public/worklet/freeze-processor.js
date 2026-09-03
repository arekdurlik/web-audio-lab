class FreezeProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.maxSamples = Math.floor(1 * sampleRate) // 1s rolling capture window
    this.recordBuf = null
    this.writePos = 0

    this.frozenBuf = null
    this.frozenLength = 0
    this.readPos = 0
    this.snapshotBuf = null // linear (oldest->newest) copy of the 1s window at trigger time

    // short crossfade from the previous frozen buffer whenever a retrim swaps it out,
    // so changing length mid-playback doesn't jump straight to a different sample value
    this.prevBuf = null
    this.prevLength = 0
    this.prevPos = 0
    this.retrimSamples = 0
    this.retrimCounter = 0

    this.state = 'live' // live | engaging | frozen | releasing
    this.mix = 0
    this.rampSamples = 1
    this.rampCounter = 0

    this.sampleLengthMs = 100
    this.rampUpMs = 20
    this.rampDownMs = 20
    this.crossfade = 50 // 0-100%: 0 = choppy hard loop, 100 = fade spans half the buffer

    this.port.onmessage = ({ data }) => {
      if (data.cmd === 'params') {
        const lengthChanged =
          data.sampleLength !== undefined && data.sampleLength !== this.sampleLengthMs
        const crossfadeChanged = data.crossfade !== undefined && data.crossfade !== this.crossfade
        if (data.sampleLength !== undefined) this.sampleLengthMs = data.sampleLength
        if (data.rampUp !== undefined) this.rampUpMs = data.rampUp
        if (data.rampDown !== undefined) this.rampDownMs = data.rampDown
        if (data.crossfade !== undefined) this.crossfade = data.crossfade

        // re-slice live from the rolling buffer so dragging the length/crossfade
        // slider while frozen updates the loop in real time, no re-trigger needed
        if ((lengthChanged || crossfadeChanged) && (this.state === 'frozen' || this.state === 'engaging')) {
          this.captureSegment(false)
        }
      } else if (data.cmd === 'freeze-on') {
        this.engage()
      } else if (data.cmd === 'freeze-off') {
        this.release()
      }
    }
  }

  ensureBuffers(channelCount) {
    if (!this.recordBuf || this.recordBuf.length !== channelCount) {
      this.recordBuf = Array.from({ length: channelCount }, () => new Float32Array(this.maxSamples))
      this.writePos = 0
    }
  }

  // takeSnapshot: true on trigger — freezes a linear copy of the full 1s rolling
  // window so later re-trims never read data live recording has since overwritten.
  // false when just re-trimming: reuses that frozen copy, so a given length
  // always maps to the exact same audio, no matter how long you've been frozen
  captureSegment(takeSnapshot) {
    const channelCount = this.recordBuf.length
    const segLen = Math.max(
      1,
      Math.min(this.maxSamples, Math.floor((this.sampleLengthMs / 1000) * sampleRate))
    )
    const fadeLen = Math.floor((Math.max(0, Math.min(100, this.crossfade)) / 100) * (segLen / 2))

    if (takeSnapshot) {
      const endPos = this.writePos
      this.snapshotBuf = this.recordBuf.map(channel => {
        const linear = new Float32Array(this.maxSamples)
        for (let i = 0; i < this.maxSamples; i++) {
          linear[i] = channel[(endPos + i) % this.maxSamples]
        }
        return linear
      })
    }

    const buf = []
    for (let ch = 0; ch < channelCount; ch++) {
      const source = this.snapshotBuf[ch]
      const out = new Float32Array(segLen)
      for (let i = 0; i < segLen; i++) {
        out[i] = source[this.maxSamples - segLen + i]
      }
      // bake a short equal-power crossfade at the loop seam so playback loops without a click
      for (let i = 0; i < fadeLen; i++) {
        const g = i / fadeLen
        const headGain = Math.sin((g * Math.PI) / 2)
        const tailGain = Math.cos((g * Math.PI) / 2)
        const head = out[i]
        const tail = out[segLen - fadeLen + i]
        out[i] = head * headGain + tail * tailGain
      }
      buf.push(out)
    }

    if (!takeSnapshot && this.frozenBuf) {
      // hand off the currently-playing buffer to the crossfade instead of cutting to it
      this.prevBuf = this.frozenBuf
      this.prevLength = this.frozenLength
      this.prevPos = this.readPos
      this.retrimSamples = Math.min(fadeLen, Math.floor(segLen / 2), Math.floor(this.frozenLength / 2))
      this.retrimCounter = 0
    }

    this.frozenBuf = buf
    this.frozenLength = segLen
    this.readPos = 0
  }

  engage() {
    if (!this.recordBuf) return

    this.captureSegment(true)
    this.readPos = 0
    this.state = 'engaging'
    this.rampSamples = Math.max(1, Math.floor((this.rampUpMs / 1000) * sampleRate))
    this.rampCounter = 0
    this.port.postMessage({ type: 'state', value: 'frozen' })
  }

  release() {
    if (this.state === 'live') return

    this.state = 'releasing'
    this.rampSamples = Math.max(1, Math.floor((this.rampDownMs / 1000) * sampleRate))
    this.rampCounter = 0
    this.port.postMessage({ type: 'state', value: 'live' })
  }

  process(inputs, outputs) {
    const input = inputs[0]
    const output = outputs[0]
    if (!input || input.length === 0) return true

    this.ensureBuffers(input.length)

    const blockSize = input[0].length
    for (let i = 0; i < blockSize; i++) {
      for (let ch = 0; ch < input.length; ch++) {
        this.recordBuf[ch][this.writePos] = input[ch][i]
      }

      if (this.state === 'engaging') {
        this.mix = Math.min(1, this.rampCounter / this.rampSamples)
        this.rampCounter++
        if (this.rampCounter >= this.rampSamples) this.state = 'frozen'
      } else if (this.state === 'releasing') {
        this.mix = Math.max(0, 1 - this.rampCounter / this.rampSamples)
        this.rampCounter++
        if (this.rampCounter >= this.rampSamples) {
          this.state = 'live'
          this.mix = 0
        }
      } else if (this.state === 'frozen') {
        this.mix = 1
      } else {
        this.mix = 0
      }

      const retrimming = this.prevBuf && this.retrimCounter < this.retrimSamples
      const retrimG = retrimming ? this.retrimCounter / this.retrimSamples : 1
      const retrimNewGain = retrimming ? Math.sin((retrimG * Math.PI) / 2) : 1
      const retrimOldGain = retrimming ? Math.cos((retrimG * Math.PI) / 2) : 0

      for (let ch = 0; ch < input.length; ch++) {
        const dry = input[ch][i]
        let frozenSample = this.frozenBuf && this.frozenLength > 0 ? this.frozenBuf[ch][this.readPos] : 0
        if (retrimming) {
          const prevSample = this.prevBuf[ch][this.prevPos % this.prevLength]
          frozenSample = prevSample * retrimOldGain + frozenSample * retrimNewGain
        }
        output[ch][i] = dry * (1 - this.mix) + frozenSample * this.mix
      }

      if (this.frozenLength > 0 && this.mix > 0) {
        this.readPos = (this.readPos + 1) % this.frozenLength
      }
      if (retrimming) {
        this.prevPos = (this.prevPos + 1) % this.prevLength
        this.retrimCounter++
        if (this.retrimCounter >= this.retrimSamples) this.prevBuf = null
      }

      this.writePos = (this.writePos + 1) % this.maxSamples
    }

    return true
  }
}

registerProcessor('freeze-processor', FreezeProcessor)
