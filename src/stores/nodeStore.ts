import { create } from 'zustand'

type NodeStore = {
  nodes: Map<string, AudioNode | AudioParam>,

  setInstance: (id: string, instance: AudioNode | AudioParam) => void
  reconnectChain: (connections: { source?: string | null, target?: string | null }[]) => void
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: new Map(),
  setInstance(id, instance) {
    get().nodes.set(id, instance)
  },
  reconnectChain(connections) {
    const nodes = get().nodes

    // disconnect all audio nodes
    Array.from(nodes)
      .filter(node => node[0] !== 'destination')
      .forEach(node => {
        if (node[1] instanceof AudioNode) node[1].disconnect()
      })

    // reconnect
    connections.forEach(con => {
      if (con.source && con.target) {
        const source = nodes.get(con.source)
        const target = nodes.get(con.target)
        if (source instanceof AudioParam) return
  
        //@ts-ignore Argument of type 'AudioNode | AudioParam' is not assignable to parameter of type 'AudioParam'
        source.connect(target)
      }

    })
  }
}))