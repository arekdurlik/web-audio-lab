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
    staticConnections: Map<string, AudioNode>;
    setConnections: (connections: { source?: string | null; target?: string | null }[]) => void;
    setInstance: (
        id: string,
        instance: AudioNode | AudioParam,
        type: 'source' | 'target' | 'param'
    ) => void;
    removeInstance: (id: string) => void;
    setStaticConnection: (id: string, target: AudioNode) => void;
    removeStaticConnection: (id: string) => void;
    reconnectChain: (connections: { source?: string | null; target?: string | null }[]) => void;
};

export const useNodeStore = create<NodeStore>((set, get) => ({
    nodes: new Map(),
    connections: [],
    staticConnections: new Map(),
    setConnections(connections) {
        get().connections = connections;
        get().reconnectChain(connections);
    },
    setInstance(id, instance, type) {
        get().nodes.set(id, { instance, type });
        get().reconnectChain(get().connections);
    },
    removeInstance(id) {
        const node = get().nodes.get(id);
        if (!node) return;

        if (node.instance instanceof AudioNode) {
            try {
                node.instance.disconnect();
            } catch {}

            if ('stop' in node.instance && typeof node.instance.stop === 'function') {
                try {
                    node.instance.stop();
                } catch {}
            }
        }

        get().nodes.delete(id);
        get().staticConnections.delete(id);
        get().reconnectChain(get().connections);
    },
    setStaticConnection(id, target) {
        get().staticConnections.set(id, target);
        get().reconnectChain(get().connections);
    },
    removeStaticConnection(id) {
        get().staticConnections.delete(id);
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

        get().staticConnections.forEach((target, id) => {
            const node = nodes.get(id);
            if (node && node.instance instanceof AudioNode) {
                try {
                    node.instance.connect(target);
                } catch {}
            }
        });
    },
}));
