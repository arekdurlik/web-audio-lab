
export const createMonoToStereoConverter = function(ctx: AudioContext) {
  const input = new GainNode(ctx)
  const splitter = new ChannelSplitterNode(ctx)
  const merger = new ChannelMergerNode(ctx)
  const output = new GainNode(ctx)

  input.connect(splitter)

  splitter.connect(merger, 0, 0)
  splitter.connect(merger, 0, 1)
  
  merger.connect(output)

  return {
    input,
    output
  }
}