import { Edge, Node } from 'reactflow';
import { create } from 'zustand';
import { initialNodes } from '../components/FlowEditor/utils';

export type Snapshot = { nodes: Node[]; edges: Edge[] };

const MAX_HISTORY = 100;

// ignores reactflow's computed layout fields (width, height, positionAbsolute, ...) so DOM remeasurement doesn't look like an edit
export function snapshotFingerprint(snapshot: Snapshot) {
    return JSON.stringify({
        nodes: snapshot.nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
        })),
        edges: snapshot.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
        })),
    });
}

type HistoryStore = {
    past: Snapshot[];
    future: Snapshot[];
    lastSnapshot: Snapshot;
    setLastSnapshot: (snapshot: Snapshot) => void;
    commit: (previous: Snapshot, next: Snapshot) => void;
    undo: (current: Snapshot) => Snapshot | null;
    redo: (current: Snapshot) => Snapshot | null;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
    past: [],
    future: [],
    lastSnapshot: { nodes: initialNodes, edges: [] },
    setLastSnapshot(snapshot) {
        set({ lastSnapshot: snapshot });
    },
    commit(previous, next) {
        set(state => ({
            past: [...state.past, previous].slice(-MAX_HISTORY),
            future: [],
            lastSnapshot: next,
        }));
    },
    undo(current) {
        const { past } = get();
        if (past.length === 0) return null;

        const previous = past[past.length - 1];
        set(state => ({
            past: state.past.slice(0, -1),
            future: [current, ...state.future],
            lastSnapshot: previous,
        }));
        return previous;
    },
    redo(current) {
        const { future } = get();
        if (future.length === 0) return null;

        const next = future[0];
        set(state => ({
            future: state.future.slice(1),
            past: [...state.past, current],
            lastSnapshot: next,
        }));
        return next;
    },
}));
