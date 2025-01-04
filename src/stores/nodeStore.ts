import { create } from 'zustand';

type NodeStore = {
    nodes: Map<
        string,
        {
            type: 'source' | 'target' | 'param';
            instance: AudioNode | AudioParam;
        }
    >;
    connections: { source?: string | null; target?: string | null }[];
    setConnections: (connections: { source?: string | null; target?: string | null }[]) => void;
    setInstance: (
        id: string,
        instance: AudioNode | AudioParam,
        type: 'source' | 'target' | 'param'
    ) => void;
    reconnectChain: (connections: { source?: string | null; target?: string | null }[]) => void;
};

export const useNodeStore = create<NodeStore>((set, get) => ({
    nodes: new Map(),
    connections: [],
    setConnections(connections) {
        get().connections = connections;
        get().reconnectChain(connections);
    },
    setInstance(id, instance, type) {
        get().nodes.set(id, { instance, type });
        get().reconnectChain(get().connections);
    },
    reconnectChain(connections) {
        const nodes = get().nodes;

        // disconnect
        Array.from(nodes)
            .filter(node => node[0] !== 'destination')
            .forEach(node => {
                // don't disconnect 'target' nodes to keep internal node connections intact
                if (node[1].instance instanceof AudioNode && node[1].type !== 'target') {
                    node[1].instance.disconnect();
                }
            });

        // reconnect
        connections.forEach(con => {
            if (con.source && con.target) {
                const source = nodes.get(con.source);
                const target = nodes.get(con.target);
                if (source && target && source.instance instanceof AudioNode) {
                    //@ts-ignore Argument of type 'AudioNode | AudioParam' is not assignable to parameter of type 'AudioParam'
                    source.instance.connect(target.instance);
                }
            }
        });
    },
}));
