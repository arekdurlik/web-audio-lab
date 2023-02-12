
export async function getLiveAudio(actx: AudioContext, output: AudioNode) {
  let stream: MediaStream

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      }})
  } catch (err) {
    console.error(err)
    return
  }
    
  if (actx.state === 'suspended') await actx.resume()

  const source = actx.createMediaStreamSource(stream)
  source.connect(output)
}