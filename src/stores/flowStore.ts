import { create } from 'zustand';

type EdgeType = 'smoothstep' | 'default';
type FlowStore = {
    edgeType: EdgeType;
    editMode: boolean;
    zoom: number;
    panning: boolean;
    setEditMode: (editMode: boolean) => void;
    getEdgeType: () => EdgeType;
    setEdgeType: (edgeType: EdgeType) => void;
    setZoom: (zoom: number) => void;
    setPanning: (panning: boolean) => void;
};

export const useFlowStore = create<FlowStore>((set, get) => ({
    edgeType: 'default',
    editMode: true,
    zoom: 2,
    panning: false,
    setEditMode: editMode => set({ editMode }),
    getEdgeType: () => get().edgeType,
    setEdgeType: edgeType => set({ edgeType }),
    setZoom: zoom => set({ zoom }),
    setPanning: panning => set({ panning }),
}));
