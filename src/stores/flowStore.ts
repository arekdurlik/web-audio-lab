import { create } from 'zustand'

type EdgeType = 'smoothstep' | 'default'
type FlowStore = {
  edgeType: EdgeType
  editMode: boolean
  zoom: number
  setEditMode: (editMode: boolean) => void
  getEdgeType: () => EdgeType
  setEdgeType: (edgeType: EdgeType) => void
  setZoom: (zoom: number) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  edgeType: 'default',
  editMode: true,
  zoom: 1,
  setEditMode: (editMode) => set({ editMode }),
  getEdgeType: () => get().edgeType,
  setEdgeType: (edgeType) => set({ edgeType }),
  setZoom: (zoom) => set({ zoom }),
}))