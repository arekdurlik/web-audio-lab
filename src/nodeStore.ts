import create from 'zustand'

type NodeStore = {
  nodes: Map<string, AudioNode>,

  setInstance: (id: string, instance: AudioNode) => void
  reconnectChain: (connections: { source: string, target: string }[]) => void
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: new Map(),
  setInstance(id, instance) {
    get().nodes.set(id, instance)
  },
  reconnectChain(connections) {
    const nodes = get().nodes

    // disconnect all nodes
    Array.from(nodes).filter(node => node[0] !== 'destination').forEach(node => {
      node[1].disconnect()
    })

    // reconnect
    connections.forEach(con => {
      const source = nodes.get(con.source)
      const target = nodes.get(con.target)
      if (!source || !target) return

      source.connect(target)
    })
  }
}))