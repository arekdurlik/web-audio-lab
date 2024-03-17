import { createMonoToStereoConverter } from './monoToStereo'
import { getLiveAudio } from './utils'

async function createAudio() {
  let source: MediaStreamAudioSourceNode
  const actx = new AudioContext({
    latencyHint: 'interactive',
    sampleRate: 44100
  })
  const destination = actx.destination
  const circuit = {
    in: new GainNode(actx),
    out: new GainNode(actx)
  }
  const monoToStereo = createMonoToStereoConverter(actx)

  await actx.audioWorklet.addModule('worklet/bit-crusher-processor.js')
  await actx.audioWorklet.addModule('worklet/gate-processor.js')
  
  monoToStereo.output.connect(circuit.in)
  circuit.out.connect(destination)
  
  async function handleGetLive() {
    try { source.disconnect() } catch {}
    const live = await getLiveAudio(actx, monoToStereo.input)
    if (live) {
      source = live
      source.connect(monoToStereo.input)
    }
  }

  handleGetLive()
  
  return {
    context: actx,
    circuit,
    getLive: () => handleGetLive()
  }
}

export { createAudio }