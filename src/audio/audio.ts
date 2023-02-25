import { createMonoToStereoConverter } from './monoToStereo'
import { getLiveAudio } from './utils'

async function createAudio() {
  const actx = new AudioContext({
    latencyHint: 'interactive',
    sampleRate: 44100
  })
  const input = new GainNode(actx)
  const destination = actx.destination
  const circuit = {
    in: new GainNode(actx),
    out: new GainNode(actx)
  }
  const monoToStereo = createMonoToStereoConverter(actx)

  await actx.audioWorklet.addModule('worklet/bit-crusher-processor.js')
  
  input.connect(monoToStereo.input)
  monoToStereo.output.connect(circuit.in)
  circuit.out.connect(destination)
  
  getLiveAudio(actx, input)

  return {
    context: actx,
    circuit
  }
}

export { createAudio }