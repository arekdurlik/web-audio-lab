import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useHistoryStore } from '../stores/historyStore';

export function useUndoRedo() {
    const reactFlowInstance = useReactFlow();
    const past = useHistoryStore(state => state.past);
    const future = useHistoryStore(state => state.future);
    const undoAction = useHistoryStore(state => state.undo);
    const redoAction = useHistoryStore(state => state.redo);

    const undo = useCallback(() => {
        const current = {
            nodes: reactFlowInstance.getNodes(),
            edges: reactFlowInstance.getEdges(),
        };
        const snapshot = undoAction(current);
        if (!snapshot) return;

        reactFlowInstance.setNodes(snapshot.nodes);
        reactFlowInstance.setEdges(snapshot.edges);
    }, [reactFlowInstance, undoAction]);

    const redo = useCallback(() => {
        const current = {
            nodes: reactFlowInstance.getNodes(),
            edges: reactFlowInstance.getEdges(),
        };
        const snapshot = redoAction(current);
        if (!snapshot) return;

        reactFlowInstance.setNodes(snapshot.nodes);
        reactFlowInstance.setEdges(snapshot.edges);
    }, [reactFlowInstance, redoAction]);

    return { undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
